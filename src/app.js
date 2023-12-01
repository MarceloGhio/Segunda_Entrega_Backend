const express = require('express');
const expressHandlebars = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB, disconnectAndReconnect } = require('../dao');
const ProductManager = require('../dao/models/ProductModel');
const CartManager = require('../dao/models/CartModel');

connectDB();

const app = express();
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', 'views');

app.get('/restart-db', (req, res) => {
    disconnectAndReconnect();
    res.send('Reiniciando la conexión a MongoDB...');
});

const productManager = new ProductManager();
const cartManager = new CartManager();

app.use(express.json());

const productRouter = require('./productRouter');
app.use('/api/products', productRouter(productManager));

const cartRouter = require('./CartRouter');
app.use('/api/carts', cartRouter(cartManager));

app.get('/', (req, res) => {
    res.send('¡Bienvenido a la aplicación de gestión de productos y carritos!');
});

const server = http.createServer(app);
const io = socketIo(server);

server.listen(8899, () => {
    console.log('Servidor Express corriendo en el puerto 8899');
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});