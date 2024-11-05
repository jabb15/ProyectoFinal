// Array global para almacenar los productos en el carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
const IVA_RATE = 0.16; // Tasa de IVA (16% por ejemplo)

// Función para agregar un producto al carrito
function addToCart(productName, productPrice) {
    // Añadir el producto al carrito global
    cart.push({ name: productName, price: productPrice });
    totalPrice += productPrice;
    localStorage.setItem('cart', JSON.stringify(cart)); // Guardar en localStorage
    localStorage.setItem('totalPrice', totalPrice.toString());
    updateCartDisplay(); // Actualizar el carrito cuando se agrega un producto
}

// Modifica la función updateCartDisplay para limpiar el total
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    if (!cartItemsContainer || !cartTotalElement) return; // Evitar errores si los contenedores no existen

    cartItemsContainer.innerHTML = ''; // Limpiar el contenido del carrito

    let totalPrice = 0; // Inicializar el precio total

    // Iterar sobre los productos en el carrito y mostrarlos
    cart.forEach((product, index) => {
        totalPrice += product.price; // Acumular el precio

        const productElement = document.createElement('div');
        productElement.innerHTML = `
            <p>${product.name} - $${product.price.toFixed(2)}</p>
            <br> <!-- Salto de línea -->
            <button onclick="removeFromCart(${index})">Eliminar</button>
        `;
        cartItemsContainer.appendChild(productElement);
    });

    // Si no hay productos, establecer el total a $0.00
    if (cart.length === 0) {
        cartTotalElement.innerText = 'Total (incluido IVA): $0.00';
        return; // Salir si el carrito está vacío
    }

    // Actualizar el total en la ventana modal incluyendo IVA
    const IVA_RATE = 0.16; // Asumiendo un IVA del 16% (ajusta según corresponda)
    const totalWithIVA = totalPrice * (1 + IVA_RATE);
    
    // Agregar salto de línea antes del total
    cartTotalElement.innerHTML = `<br>Total (incluido IVA): $${totalWithIVA.toFixed(2)}`;
}

// Función para eliminar un producto del carrito
function removeFromCart(index) {
    const product = cart[index];
    totalPrice -= product.price; // Restar el precio del producto del total
    cart.splice(index, 1); // Eliminar el producto del carrito
    localStorage.setItem('cart', JSON.stringify(cart)); // Actualizar localStorage
    localStorage.setItem('totalPrice', totalPrice.toString());
    updateCartDisplay(); // Actualizar el carrito
}

// Función para abrir la ventana modal del carrito
function openModal() {
    document.getElementById('cart-modal').style.display = 'block'; // Mostrar la modal del carrito
    updateCartDisplay(); // Asegurar que el carrito se muestre actualizado
}

// Función para cerrar la ventana modal del carrito
function closeModal() {
    document.getElementById('cart-modal').style.display = 'none'; // Ocultar la modal del carrito
}

// Función para confirmar el pago de todos los productos en el carrito
function confirmPayment() {
    if (cart.length === 0) {
        alert("No hay productos en el carrito para pagar.");
    } else {
        alert("Pago confirmado. ¡Gracias por su compra!");
        cart = []; // Limpiar el carrito después del pago
        totalPrice = 0;
        localStorage.removeItem('cart'); // Limpiar localStorage después del pago
        localStorage.removeItem('totalPrice');
        updateCartDisplay(); // Actualizar el carrito
        closeModal(); // Cerrar la ventana modal
    }
}

// Abre la ventana modal de pago
function payForProduct(productName, productPrice) {
    openPaymentModal(productName, productPrice);
}

// Mostrar la ventana modal
function openPaymentModal(productName, productPrice) {
    document.getElementById('payment-product-name').innerText = `Producto: ${productName}`;
    const totalWithIVA = productPrice * (1 + IVA_RATE);
    document.getElementById('payment-product-price').innerText = `Total a pagar (incluido IVA): $${totalWithIVA.toFixed(2)}`;
    document.getElementById('payment-modal').style.display = 'block'; 
}

 // Cierra la ventana modal de pago
function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

// Cerrar la ventana modal después de confirmar el pago
function confirmPayment() {
    alert('Pago confirmado. ¡Gracias por su compra!');
    closePaymentModal(); 
}

function submitCartCustomerInfo() {
    const name = document.getElementById('cart-name').value;
    const email = document.getElementById('cart-email').value;
    const address = document.getElementById('cart-address').value;
    const tarjet = document.getElementById('cart-tarjet').value;

    if (name && email && address && tarjet) {
        // Generar la factura en PDF con los datos del formulario
        generateInvoicePDF(name, email, address, tarjet);
        
        alert(`Compra confirmada. Gracias por tu compra, ${name}!`);
        
        clearCart();        // Vaciar el carrito
        resetCartForm();    // Reiniciar el formulario del carrito
        closeCartModal();   // Cerrar la ventana del carrito
    } else {
        alert('No hay productos o los campos están vacíos.');
    }
}

// Función para generar la factura en PDF
function generateInvoicePDF(name, email, address, tarjet) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Agregar contenido a la factura PDF
    doc.setFontSize(18);
    doc.text("ZonaTec", 10, 10);

    doc.setFontSize(18);
    doc.text("Factura de Compra", 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Nombre: ${name}`, 10, 40);
    doc.text(`Email: ${email}`, 10, 50);
    doc.text(`Dirección: ${address}`, 10, 60);
    doc.text(`Número de Tarjeta: ${tarjet}`, 10, 70);
    doc.text("Productos:", 10, 90);

    let yPosition = 100;
    let totalPrice = 0;

    // Agregar cada producto del carrito a la factura
    cart.forEach((product) => {
        doc.text(`- ${product.name}: $${product.price.toFixed(2)}`, 10, yPosition);
        yPosition += 10;
        totalPrice += product.price;
    });

    const IVA_RATE = 0.16; // IVA del 16%
    const totalWithIVA = totalPrice * (1 + IVA_RATE);

    // Agregar el total a la factura
    doc.text(`Total (incluido IVA): $${totalWithIVA.toFixed(2)}`, 10, yPosition + 20);

    // Guardar el PDF con un nombre de archivo específico
    doc.save(`Factura_${name}.pdf`);
}

function resetCart() {
    cart = []; // Vaciar el array del carrito

    // Reiniciar el total del precio
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        cartTotal.textContent = '$0.00'; // Establecer el total a 0
    }

    // Actualizar la vista del carrito para reflejar que está vacío
    updateCartDisplay(); 

    alert('El carrito ha sido reiniciado.'); // Mensaje opcional
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'none'; // Cerrar el modal del carrito
}

// Función para vaciar el carrito
function clearCart() {
    cart = []; // Vaciar el array de productos
    updateCartDisplay(); // Actualizar el carrito para reflejar los cambios
}

// Función para reiniciar el formulario del carrito
function resetCartForm() {
    document.getElementById('cart-name').value = ''; // Limpiar nombre
    document.getElementById('cart-email').value = ''; // Limpiar email
    document.getElementById('cart-address').value = ''; // Limpiar direccion
    document.getElementById('cart-tarjet').value = ''; // Limpiar tarjeta
}

function submitPaymentCustomerInfo() {
    const name = document.getElementById('payment-name').value; 
    const email = document.getElementById('payment-email').value; 
    const address = document.getElementById('payment-address').value; 
    const phone = document.getElementById('payment-tarjet').value; 

    if (name && email && address && phone) {
        alert(`Compra confirmada. Gracias por tu compra, ${name}!`);
        closePaymentModal(); // Cerrar la ventana de pago

        // Reiniciar el carrito (vaciarlo)
        resetPayment();

        // Borrar los datos del formulario
        resetPaymentForm();

        // Cerrar la ventana del carrito
        closePaymentModal();
    } else {
        alert('Por favor, rellena todos los campos para continuar.');
    }
}

function resetPayment() {
    cart = []; // Vaciar el array del carrito

    // Reiniciar el total del precio
    document.getElementById('cart-total').textContent = '$0.00';

    // Actualizar la vista del carrito para reflejar que está vacío
    updateCartDisplay(); 
}

// Función para vaciar los campos del formulario de pago
function resetPaymentForm() {
    document.getElementById('payment-name').value = ''; // Limpiar nombre
    document.getElementById('payment-email').value = ''; // Limpiar email
    document.getElementById('payment-address').value = ''; // Limpiar dirección
    document.getElementById('payment-tarjet').value = ''; // Limpiar teléfono
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'none'; // Cerrar el modal
}

// Función para cerrar la ventana modal del carrito al hacer clic en la "X"
function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}