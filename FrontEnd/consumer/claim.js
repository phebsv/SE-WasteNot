// Backend API Configuration
const API_URL = "http://localhost:8081/api";
const ORDER_API_URL = 'http://localhost:8081/api/orders';

let product = null;

// Load product from backend
async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));

  if (!productId) {
    alert("Product not found");
    window.location.href = "consumer-marketplace.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      product = {
        id: data.data.id,
        name: data.data.name,
        partner: data.data.partnerName,
        price: data.data.price,
        oldPrice: data.data.oldPrice,
        discountPercent: data.data.discountPercent,
        image: data.data.imageUrl || "placeholder.jpg",
        expiry: data.data.expiryDisplay || "Check with provider",
        pickupWindow: data.data.pickupWindow || "Contact provider"
      };
      
      // Fill UI
      document.getElementById("productImage").src = product.image;
      document.getElementById("productName").textContent = product.name;
      document.getElementById("partnerName").textContent = product.partner;
      document.getElementById("expiry").textContent = "Expiry: " + product.expiry;
      document.getElementById("pickupWindow").textContent = "Pickup Window: " + product.pickupWindow;
      
      setupConfirmButton();
    } else {
      alert("Product not found");
      window.location.href = "consumer-marketplace.html";
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert("Failed to load product. Please try again.");
  }
}

function setupConfirmButton() {
  const confirmBtn = document.getElementById("confirmBtn");

  // Confirm claim and post to backend
  confirmBtn.onclick = async function () {
    const qty = Number(document.getElementById("quantityInput").value);
    const date = document.getElementById("pickupDate").value;
    const time = document.getElementById("pickupTime").value);

    if (!date || !time) {
        alert("Please choose a valid pickup date and time.");
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("Please login first");
        window.location.href = "../login/login-consumer.html";
        return;
    }

    // Create order payload
    const orderData = {
        consumerId: parseInt(userId),
        productId: product.id,
        quantity: qty,
        pickupDate: date,
        status: 'PENDING'
    };

    try {
        const response = await fetch(ORDER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Failed to create order');
        
        const result = await response.json();
        console.log('Order created:', result);

        // SHOW TOAST
        const toast = document.getElementById("toast");
        toast.classList.remove("hidden");
        toast.classList.add("show");

        // OK BUTTON HANDLER
        document.getElementById("toastOkBtn").onclick = () => {
            toast.classList.remove("show");
            toast.classList.add("hidden");

            // Redirect to orders page
            setTimeout(() => {
                window.location.href = "consumer-orders.html";
            }, 250);
        };
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to place order. Please try again.');
    }
  };
}

// Initialize on page load
loadProduct();
