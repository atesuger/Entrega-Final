let iconCart = document.querySelector('.icon-cart');
let closeCart = document.querySelector('.close');
let body = document.querySelector('body');
let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');

let listProducts = [];
let carts = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
});
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart')
});

const agregarDatosAHTML = () => {
    listProductHTML.innerHTML = '';
    if (listProducts.length > 0) {
        listProducts.forEach(producto => {
            let nuevoProducto = document.createElement('div');
            nuevoProducto.classList.add('item');
            nuevoProducto.dataset.id = producto.id;
            nuevoProducto.innerHTML = `
                <img src="${producto.image}" alt="">
                <h2>${producto.name}</h2>
                <div class="price">$${producto.price}</div>
                <button class="addCart">
                    Agregar al Carrito
                </button>
            `;
            listProductHTML.appendChild(nuevoProducto);
        })
    }
};

listProductHTML.addEventListener('click', (event) => {
    let posicionClick = event.target;
    if (posicionClick.classList.contains('addCart')) {
        let product_id = posicionClick.parentElement.dataset.id;
        agregarAlCarrito(product_id);
    }
});

const agregarAlCarrito = (product_id) => {
    let posicionProductoEnCarrito = carts.findIndex((valor) => valor.product_id == product_id);
    if (carts.length <= 0) {
        carts = [{
            product_id: product_id,
            quantity: 1
        }];
    } else if (posicionProductoEnCarrito < 0) {
        carts.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        carts[posicionProductoEnCarrito].quantity = carts[posicionProductoEnCarrito].quantity + 1;
    }
    agregarCarritoAHTML();
    agregarCarritoAMemoria();
};

const agregarCarritoAMemoria = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
};

const agregarCarritoAHTML = () => {
    listCartHTML.innerHTML = '';
    let cantidadTotal = 0;
    if (carts.length > 0) {
        carts.forEach(carrito => {
            cantidadTotal = cantidadTotal + carrito.quantity;
            let nuevoCarrito = document.createElement('div');
            nuevoCarrito.classList.add('item');
            nuevoCarrito.dataset.id = carrito.product_id;
            let posicionProducto = listProducts.findIndex((value) => value.id == carrito.product_id);
            let info = listProducts[posicionProducto];
            nuevoCarrito.innerHTML = `
                <div class="image">
                    <img src="${info.image}" alt="">
                </div>
                <div class="name">
                    ${info.name}
                </div>
                <div class="totalPrice">
                    $${info.price * carrito.quantity}
                </div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${carrito.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
            listCartHTML.appendChild(nuevoCarrito);
        })
    }
    iconCartSpan.innerText = cantidadTotal;
};

listCartHTML.addEventListener('click', (event) => {
    let posicionClick = event.target;
    if (posicionClick.classList.contains('minus') || posicionClick.classList.contains('plus')) {
        let product_id = posicionClick.parentElement.parentElement.dataset.id;
        let tipo = 'minus';
        if (posicionClick.classList.contains('plus')) {
            tipo = 'plus';
        }
        cambiarCantidad(product_id, tipo);
    }
});

const cambiarCantidad = (product_id, tipo) => {
    let posicionItemEnCarrito = carts.findIndex((value) => value.product_id == product_id);
    if (posicionItemEnCarrito >= 0) {
        switch (tipo) {
            case 'plus':
                carts[posicionItemEnCarrito].quantity = carts[posicionItemEnCarrito].quantity + 1;
                break;
            default:
                let valorCambio = carts[posicionItemEnCarrito].quantity - 1;
                if (valorCambio > 0) {
                    carts[posicionItemEnCarrito].quantity = valorCambio;
                } else {
                    carts.splice(posicionItemEnCarrito, 1);
                }
                break;
        }
    }
    agregarCarritoAMemoria();
    agregarCarritoAHTML();
};

const inicializarApp = () => {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            listProducts = data;
            agregarDatosAHTML();

            if (localStorage.getItem('cart')) {
                carts = JSON.parse(localStorage.getItem('cart'));
                agregarCarritoAHTML();
            }
        });
};

inicializarApp();

$(document).ready(function() {
    $('.checkOut').click(function() {
        $('#form-checkout').removeClass('hidden').addClass('visible');
        $('#modal-overlay').removeClass('hidden').addClass('visible');
        inicializarMercadoPago();
    });

    $('.close, #modal-overlay').click(function() {
        $('#form-checkout').removeClass('visible').addClass('hidden');
        $('#modal-overlay').removeClass('visible').addClass('hidden');
    });

    function inicializarMercadoPago() {
        if ($('#form-checkout').hasClass('visible')) {
            const totalMonto = calcularMontoTotal();

            const mp = new window.MercadoPago("TEST-e6d81916-d4c1-4f54-a70f-ae30841d62a4");
            const formularioTarjeta = mp.cardForm({
                amount: totalMonto.toString(),
                iframe: true,
                form: {
                    id: "form-checkout",
                    cardNumber: {
                        id: "form-checkout__cardNumber",
                        placeholder: "Numero de tarjeta",
                    },
                    expirationDate: {
                        id: "form-checkout__expirationDate",
                        placeholder: "MM/YY",
                    },
                    securityCode: {
                        id: "form-checkout__securityCode",
                        placeholder: "Código de seguridad",
                    },
                    cardholderName: {
                        id: "form-checkout__cardholderName",
                        placeholder: "Titular de la tarjeta",
                    },
                    issuer: {
                        id: "form-checkout__issuer",
                        placeholder: "Banco emisor",
                    },
                    installments: {
                        id: "form-checkout__installments",
                        placeholder: "Cuotas",
                    },
                    identificationType: {
                        id: "form-checkout__identificationType",
                        placeholder: "Tipo de documento",
                    },
                    identificationNumber: {
                        id: "form-checkout__identificationNumber",
                        placeholder: "Número del documento",
                    },
                    cardholderEmail: {
                        id: "form-checkout__cardholderEmail",
                        placeholder: "E-mail",
                    },
                },
                callbacks: {
                    onFormMounted: error => {
                        if (error) return console.warn("Form Mounted handling error: ", error);
                    },
                    onSubmit: event => {
                        event.preventDefault();

                        const {
                            paymentMethodId: payment_method_id,
                            issuerId: issuer_id,
                            cardholderEmail: email,
                            amount,
                            token,
                            installments,
                            identificationNumber,
                            identificationType,
                        } = formularioTarjeta.getCardFormData();

                        setTimeout(() => {
                            alert("Su pago fue procesado correctamente");
                            carts = [];
                            localStorage.removeItem('cart');
                            agregarCarritoAHTML();
if (body.className.indexOf('showCart') === -1) {
    body.className += ' showCart';
} else {
    body.className = body.className.replace('showCart', '').trim();
}
                            $('#form-checkout').removeClass('visible').addClass('hidden');
                            $('#modal-overlay').removeClass('visible').addClass('hidden');
                        }, 2000);
                    },
                    onFetching: (resource) => {
                        const barraProgreso = document.querySelector(".progress-bar");
                        barraProgreso.removeAttribute("value");

                        return () => {
                            barraProgreso.setAttribute("value", "0");
                        };
                    }
                },
            });
        }
    }
});

function calcularMontoTotal() {
    let total = 0;
    carts.forEach(carrito => {
        let posicionProducto = listProducts.findIndex(producto => producto.id == carrito.product_id);
        if (posicionProducto !== -1) {
            let producto = listProducts[posicionProducto];
            total += producto.price * carrito.quantity;
        }
    });
    return total;
}

$(document).ready(function() {
    $('.checkOut').click(function() {
        $('#form-checkout').removeClass('hidden').addClass('visible');
        $('#modal-overlay').removeClass('hidden').addClass('visible');
    });

    $('.close, #modal-overlay').click(function() {
        $('#form-checkout').removeClass('visible').addClass('hidden');
        $('#modal-overlay').removeClass('visible').addClass('hidden');
    });
});
