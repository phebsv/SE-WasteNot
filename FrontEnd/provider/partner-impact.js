// ===== AUTH GUARD =====
if (!localStorage.getItem("authToken") || localStorage.getItem("userRole") !== "partner") {
    window.location.href = "../login/login-partner.html";
}

const PRODUCTS_API = 'http://localhost:8081/api/products';
const ORDERS_API = 'http://localhost:8081/api/orders';

function unwrapData(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
}

function normalizeStatus(rawStatus) {
    const s = String(rawStatus || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
    if (!s) return 'PENDING';

    if (s === 'READY') return 'READY_FOR_PICKUP';
    if (s === 'PICKED_UP' || s === 'PICKEDUP') return 'COMPLETED';

    const allowed = new Set(['PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']);
    return allowed.has(s) ? s : 'PENDING';
}

function getOrderDate(order) {
    const raw = order?.orderDate || order?.createdAt || order?.dateCreated || order?.updatedAt || order?.date;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function isDonationProduct(product) {
    const type = String(product?.type || product?.listingType || '').trim().toLowerCase();
    const price = Number(product?.price);
    return type === 'donation' || price === 0;
}

function formatPeso(value) {
    const n = Number(value) || 0;
    return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pctChange(current, previous) {
    const c = Number(current) || 0;
    const p = Number(previous) || 0;
    if (p === 0) {
        if (c === 0) return null;
        return { sign: 'positive', text: 'New vs previous period' };
    }
    const pct = ((c - p) / p) * 100;
    const sign = pct >= 0 ? 'positive' : 'negative';
    return { sign, text: `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% vs previous period` };
}

function parseRangeDays(label) {
    const v = String(label || '').toLowerCase();
    if (v.includes('7')) return 7;
    if (v.includes('90')) return 90;
    return 30;
}

function bucketIndex(d, start, days) {
    const totalMs = days * 24 * 60 * 60 * 1000;
    const t = Math.max(0, Math.min(totalMs - 1, d.getTime() - start.getTime()));
    const ratio = t / totalMs;
    // 4 buckets
    return Math.min(3, Math.max(0, Math.floor(ratio * 4)));
}

function buildWeekLabels(days) {
    if (days <= 7) return ['Days 1–2', 'Days 3–4', 'Days 5–6', 'Day 7'];
    if (days <= 30) return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return ['Period 1', 'Period 2', 'Period 3', 'Period 4'];
}

let charts = {
    wasteBar: null,
    categoryPie: null,
    salesLine: null,
    donationBar: null
};

async function loadPartnerImpactSource() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return { products: [], orders: [] };

        const [productsRes, ordersRes] = await Promise.all([
            fetch(PRODUCTS_API),
            fetch(`${ORDERS_API}/partner/${userId}`)
        ]);

        const productsJson = productsRes.ok ? await productsRes.json() : null;
        const ordersJson = ordersRes.ok ? await ordersRes.json() : null;

        const allProducts = unwrapData(productsJson);
        const products = allProducts.filter(p => String(p.partnerId) === String(userId));
        const orders = unwrapData(ordersJson).map(o => ({
            ...o,
            status: normalizeStatus(o.status)
        }));

        return { products, orders };
    } catch (error) {
        console.error('Error loading impact data:', error);
        return { products: [], orders: [] };
    }
}

function computeImpact({ products, orders, rangeDays }) {
    const productById = new Map(products.map(p => [p.id, p]));

    const now = new Date();
    const start = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const prevStart = new Date(start.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const inCurrent = [];
    const inPrevious = [];

    for (const o of orders) {
        const d = getOrderDate(o);
        if (!d) continue;
        if (d >= start && d <= now) inCurrent.push({ ...o, _date: d });
        else if (d >= prevStart && d < start) inPrevious.push({ ...o, _date: d });
    }

    const completedCurrent = inCurrent.filter(o => o.status === 'COMPLETED');
    const completedPrevious = inPrevious.filter(o => o.status === 'COMPLETED');

    const qtySum = arr => arr.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

    const donationQty = arr => arr.reduce((sum, o) => {
        const p = productById.get(o.productId);
        if (!p) return sum;
        return sum + (isDonationProduct(p) ? (Number(o.quantity) || 0) : 0);
    }, 0);

    const revenueSum = arr => arr.reduce((sum, o) => {
        const p = productById.get(o.productId);
        if (!p || isDonationProduct(p)) return sum;
        if (Number.isFinite(Number(o.totalAmount))) return sum + Number(o.totalAmount);
        return sum + ((Number(p.price) || 0) * (Number(o.quantity) || 0));
    }, 0);

    const wasteKgCurrent = qtySum(completedCurrent) * 0.6;
    const wasteKgPrevious = qtySum(completedPrevious) * 0.6;

    const donationCountCurrent = donationQty(completedCurrent);
    const donationCountPrevious = donationQty(completedPrevious);

    const revenueCurrent = revenueSum(completedCurrent);
    const revenuePrevious = revenueSum(completedPrevious);

    const labels = buildWeekLabels(rangeDays);
    const weeklyWaste = [0, 0, 0, 0];
    const weeklyRevenue = [0, 0, 0, 0];
    const weeklyDonations = [0, 0, 0, 0];
    const categoryWaste = new Map();

    for (const o of completedCurrent) {
        const product = productById.get(o.productId);
        const qty = Number(o.quantity) || 0;
        const wasteKg = qty * 0.6;
        const idx = bucketIndex(o._date, start, rangeDays);

        weeklyWaste[idx] += wasteKg;

        if (product && isDonationProduct(product)) {
            weeklyDonations[idx] += qty;
        } else {
            weeklyRevenue[idx] += (Number(o.totalAmount) || ((Number(product?.price) || 0) * qty));
        }

        const category = String(product?.category || product?.categoryName || product?.type || 'Uncategorized').trim() || 'Uncategorized';
        categoryWaste.set(category, (categoryWaste.get(category) || 0) + wasteKg);
    }

    const pieLabels = Array.from(categoryWaste.keys());
    const pieValues = Array.from(categoryWaste.values());

    const bestWasteIdx = weeklyWaste.reduce((best, v, i, a) => (v > a[best] ? i : best), 0);
    const bestWasteKg = weeklyWaste[bestWasteIdx] || 0;

    let bestCategory = null;
    let bestCategoryKg = 0;
    for (const [k, v] of categoryWaste.entries()) {
        if (v > bestCategoryKg) {
            bestCategoryKg = v;
            bestCategory = k;
        }
    }

    const bestRevIdx = weeklyRevenue.reduce((best, v, i, a) => (v > a[best] ? i : best), 0);
    const bestRev = weeklyRevenue[bestRevIdx] || 0;
    const totalRev = weeklyRevenue.reduce((s, v) => s + v, 0);
    const revShare = totalRev > 0 ? (bestRev / totalRev) * 100 : 0;

    return {
        rangeDays,
        labels,
        kpis: {
            wasteKgCurrent,
            wasteKgPrevious,
            donationCountCurrent,
            donationCountPrevious,
            revenueCurrent,
            revenuePrevious,
            co2SavedKg: wasteKgCurrent * 1.2
        },
        series: {
            weeklyWaste,
            weeklyRevenue,
            weeklyDonations,
            pieLabels,
            pieValues
        },
        captions: {
            wasteCaption: bestWasteKg > 0 ? `${labels[bestWasteIdx]} had the highest waste diversion: ${bestWasteKg.toFixed(1)} kg` : 'No completed orders in this period.',
            categoryCaption: bestCategory ? `Most diverted category: ${bestCategory} (${bestCategoryKg.toFixed(1)} kg)` : 'No category data in this period.',
            salesCaption: totalRev > 0 ? `Revenue peaked in ${labels[bestRevIdx]} (${revShare.toFixed(0)}% of revenue)` : 'No revenue in this period.',
            donationCaption: weeklyDonations.reduce((s, v) => s + v, 0) > 0 ? 'Donations shown as completed donation quantities.' : 'No donations in this period.'
        }
    };
}

function applyChangeBadge(el, change) {
    if (!el) return;
    if (!change) {
        el.textContent = '';
        el.classList.remove('positive', 'negative');
        return;
    }
    el.textContent = change.text;
    el.classList.remove('positive', 'negative');
    el.classList.add(change.sign);
}

function renderCharts(impact) {
    const wasteBarEl = document.getElementById('wasteBar');
    const pieEl = document.getElementById('categoryPie');
    const salesEl = document.getElementById('salesLine');
    const donationEl = document.getElementById('donationBar');

    if (!wasteBarEl || !pieEl || !salesEl || !donationEl) return;

    // Destroy old charts on re-render
    Object.values(charts).forEach(ch => {
        if (ch && typeof ch.destroy === 'function') ch.destroy();
    });

    charts.wasteBar = new Chart(wasteBarEl, {
        type: 'bar',
        data: {
            labels: impact.labels,
            datasets: [{
                label: 'Waste Reduced (kg)',
                data: impact.series.weeklyWaste.map(v => Number(v.toFixed(2))),
                backgroundColor: '#15803d',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Kilograms' } } },
            plugins: { legend: { display: false } }
        }
    });

    charts.categoryPie = new Chart(pieEl, {
        type: 'pie',
        data: {
            labels: impact.series.pieLabels.length ? impact.series.pieLabels : ['No data'],
            datasets: [{
                data: impact.series.pieValues.length ? impact.series.pieValues.map(v => Number(v.toFixed(2))) : [1],
                backgroundColor: ['#15803d', '#7fd16b', '#bfe0b8', '#f4faef', '#9ca3af']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'right' } } }
    });

    charts.salesLine = new Chart(salesEl, {
        type: 'line',
        data: {
            labels: impact.labels,
            datasets: [{
                label: 'Revenue (₱)',
                data: impact.series.weeklyRevenue.map(v => Number(v.toFixed(2))),
                borderColor: '#15803d',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(21, 128, 61, 0.1)'
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Revenue (₱)' } } },
            plugins: { legend: { display: false } }
        }
    });

    charts.donationBar = new Chart(donationEl, {
        type: 'bar',
        data: {
            labels: impact.labels,
            datasets: [{
                label: 'Donations (qty)',
                data: impact.series.weeklyDonations,
                backgroundColor: '#7fd16b',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Quantity' } } },
            plugins: { legend: { display: false } }
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // --- Logout and Avatar Setup ---
    const avatarInitial = document.getElementById("avatarInitial");
    const userName = localStorage.getItem('userName');
    if (avatarInitial && userName) {
        avatarInitial.textContent = userName.charAt(0).toUpperCase();
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Clear only auth/session flags; keep cached profile + app data.
            [
                'authToken',
                'userId',
                'userRole',
                'userName',
                'userEmail',
                'ngoName',
                'consumerLoggedIn',
                'partnerLoggedIn',
                'providerLoggedIn',
                'ngoLoggedIn',
                'adminLoggedIn'
            ].forEach(k => localStorage.removeItem(k));
            sessionStorage.clear();
            window.location.href = "../login/login-partner.html";
        });
    }

    const dateFilter = document.getElementById('dateFilter');
    const source = await loadPartnerImpactSource();

    async function render() {
        const rangeDays = parseRangeDays(dateFilter?.value);
        const impact = computeImpact({ ...source, rangeDays });

        // KPIs
        const wasteEl = document.getElementById('wasteKg');
        const co2El = document.getElementById('co2Saved');
        const donationsEl = document.getElementById('donationCount');
        const revenueEl = document.getElementById('revenue');

        if (wasteEl) wasteEl.textContent = `${impact.kpis.wasteKgCurrent.toFixed(1)} kg`;
        if (co2El) co2El.textContent = `${impact.kpis.co2SavedKg.toFixed(1)} kg`;
        if (donationsEl) donationsEl.textContent = String(impact.kpis.donationCountCurrent);
        if (revenueEl) revenueEl.textContent = formatPeso(impact.kpis.revenueCurrent);

        applyChangeBadge(document.getElementById('wasteChange'), pctChange(impact.kpis.wasteKgCurrent, impact.kpis.wasteKgPrevious));
        applyChangeBadge(document.getElementById('donationChange'), pctChange(impact.kpis.donationCountCurrent, impact.kpis.donationCountPrevious));
        applyChangeBadge(document.getElementById('revenueChange'), pctChange(impact.kpis.revenueCurrent, impact.kpis.revenuePrevious));

        // Captions
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text || '';
        };
        setText('wasteCaption', impact.captions.wasteCaption);
        setText('categoryCaption', impact.captions.categoryCaption);
        setText('salesCaption', impact.captions.salesCaption);
        setText('donationCaption', impact.captions.donationCaption);

        // Charts
        renderCharts(impact);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            render();
        });
    }

    render();
});

// Global function stub for PDF export
function exportPDF() {
    alert("Impact Report exported as PDF!");
    // Logic for generating and downloading the report would go here
}