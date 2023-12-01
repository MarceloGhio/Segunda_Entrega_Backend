const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const cartSchema = new Schema({
    id: { type: String, default: uuidv4, required: true },
    products: [
        {
            id: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
});

const Cart = mongoose.model('Cart', cartSchema);

class CartManager {
    constructor() {
        // No se inicializan los carritos aquí
    }

    async initializeCarts() {
        try {
            const carts = await Cart.find();
            this.carts = carts;
            this.updateCartIdCounter();
        } catch (err) {
            this.carts = [];
        }
    }

    updateCartIdCounter() {
        if (this.carts.length > 0) {
            const maxId = Math.max(...this.carts.map((cart) => cart.id));
            this.cartIdCounter = maxId + 1;
        }
    }

    saveCarts() {
        Cart.insertMany(this.carts)
            .then(() => console.log('Carritos guardados en MongoDB'))
            .catch((err) => console.error('Error al guardar carritos en MongoDB:', err.message));
    }

    createCart(cart) {
        const cartId = this.generateUniqueId();
        cart.id = cartId;
        cart.products = [];
        this.carts.push(cart);
        this.saveCarts();
        return cartId;
    }

    getCartById(cartId) {
        const cart = this.carts.find((existingCart) => existingCart.id === cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        return cart;
    }

    addProductToCart(cartId, productId, quantity) {
        const cart = this.getCartById(cartId);
        const productIndex = cart.products.findIndex((product) => product.id === productId);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ id: productId, quantity });
        }

        this.saveCarts();
    }

    generateUniqueId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

module.exports = CartManager;
