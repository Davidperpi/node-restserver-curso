const express = require('express');

const { verficaToken } = require('../middlewares/autenticacion');

const app = express();
const Producto = require('../models/producto');

// ===============================
// Buscar productos
// ===============================
app.get('/productos/buscar/:termino', verficaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })
});

// ===============================
// Obtener todos los productos
// ===============================
app.get('/productos', verficaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count((err, conteo) => {
                res.json({
                    ok: true,
                    conteo,
                    productos
                })
            });
        });
});

// ===============================
// Obtener un producto por id
// ===============================
app.get('/productos/:id', verficaToken, (req, res) => {
    // populate: usuario categoria
    // paginado
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        })
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion');
});

// ===============================
// Crear nuevo producto
// ===============================
app.post('/productos', verficaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});


// ===============================
// Actualizar producto
// ===============================
app.put('/productos/:id', verficaToken, (req, res) => {
    // grabar usuario
    // grabar una categoria
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.categoria = body.categoria;
        productoDB.usuario = req.usuario._id;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });

});

// ===============================
// Borrar un producto
// ===============================
app.delete('/productos/:id', verficaToken, (req, res) => {
    // cambia disponible a false
    let id = req.params.id;

    let disponibilidad = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, disponibilidad, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            usuario: 'Producto borrado'
        })
    });
});

module.exports = app;