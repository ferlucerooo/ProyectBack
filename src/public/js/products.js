let cartId = sessionStorage.getItem('cartId');

async function createCart() {
    try {
        const response = await fetch('/api/carts/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.status === 'success') {
            cartId = data.cartId;
            sessionStorage.setItem('cartId', cartId);
            alert('Carrito creado exitosamente');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert(error.message || 'Error al crear el carrito');
    }
}

async function addProductToCart(productId) {
    try {
        if (!cartId) {
            alert('Debes crear un carrito primero');
            return;
        }

        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorText = await response.text(); // Obtener el texto de error
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();

        if (data.status === 'success') {
            alert(`Producto con id ${productId} agregado al carrito exitosamente`);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        alert(error.message || `Error al agregar el producto con id ${productId} al carrito`);
    }
}

async function viewCart() {
    try {
        if (!cartId) {
            alert('Debes crear un carrito antes de verlo.');
            return;
        }
        window.location.href = `/api/carts/${cartId}`;
    } catch (error) {
        alert(error.message || 'Error al mostrar el carrito');
    }
}

// Event listeners para los botones de agregar al carrito
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function () {
        const productId = this.dataset.productId;
        addProductToCart(productId);
    });
});

// Botón para crear carrito
document.querySelector('#create-cart-btn').addEventListener('click', createCart);

// Botón para ver carrito
document.querySelector('#view-cart-btn').addEventListener('click', viewCart);