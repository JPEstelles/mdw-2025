# mdw-2025
# Documentación de APIs principales

**URL Base:**  
https://mdw-2025-xnah.onrender.com

---

## Registro de Usuario

**Endpoint:**  
POST `/api/auth/register`  
_Registra un nuevo usuario en el sistema_

**Request:**
```json
{
  "username": "string (requerido, único)",
  "email": "string (requerido, único)",
  "password": "string (requerido, min 6 caracteres)"
}
```

**Response:**
```json
{
  "message": "Usuario registrado correctamente"
}
```

---

## Login de Usuario

**Endpoint:**  
POST `/api/auth/login`  
_Inicia sesión y obtiene tokens de acceso_

**Request:**
```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Response:**
```json
{
  "accessToken": "jwt_de_acceso",
  "refreshToken": "jwt_refresh"
}
```

---

## Refresh Token

**Endpoint:**  
POST `/api/auth/refresh`  
_Obtiene un nuevo accessToken usando el refreshToken_

**Request:**
```json
{
  "refreshToken": "jwt_refresh"
}
```

**Response:**
```json
{
  "accessToken": "nuevo_jwt_de_acceso"
}
```

---

## Logout

**Endpoint:**  
POST `/api/auth/logout`  
_Cierra la sesión del usuario (requiere autenticación)_

**Response:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

## Listar Productos

**Endpoint:**  
GET `/api/products`  
_Obtiene el listado de productos disponibles_

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "price": 123,
    "stock": 5
  }
]
```

---

## Obtener un Producto por ID

**Endpoint:**  
GET `/api/products/:id`  
_Obtiene los datos de un producto específico_

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "price": 123,
  "stock": 5
}
```

---

## Crear Producto _(admin)_

**Endpoint:**  
POST `/api/products`  
_Crea un nuevo producto (requiere autenticación de admin)_

**Request:**
```json
{
  "name": "string",
  "description": "string",
  "price": 123,
  "stock": 5
}
```

**Response:**
```json
{
  "message": "Producto creado correctamente",
  "product": { ... }
}
```

---

## Agregar Producto al Carrito

**Endpoint:**  
POST `/api/cart/add`  
_Agrega un producto al carrito del usuario autenticado_

**Request:**
```json
{
  "productId": "string (id del producto)",
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Producto agregado al carrito",
  "cart": { ... }
}
```

---

## Quitar Producto del Carrito

**Endpoint:**  
POST `/api/cart/remove`  
_Quita una cantidad de un producto o el producto completo del carrito_

**Request:**
```json
{
  "productId": "string (id del producto)",
  "quantity": 1 // opcional, si no se envía elimina todo el producto
}
```

**Response:**
```json
{
  "message": "Producto(s) removido(s) del carrito",
  "cart": { ... }
}
```

---

## Vaciar Carrito

**Endpoint:**  
POST `/api/cart/clear`  
_Elimina todos los productos del carrito del usuario_

**Response:**
```json
{
  "message": "Carrito vaciado"
}
```

---

## Obtener Carrito

**Endpoint:**  
GET `/api/cart`  
_Obtiene el carrito del usuario autenticado_

**Response:**
```json
{
  "_id": "string",
  "user": "string",
  "items": [
    {
      "product": {
        "_id": "string",
        "name": "string",
        "price": 123
      },
      "quantity": 2
    }
  ],
  "totalPrice": 246
}
```

---

## Notas

- Los endpoints de carrito y productos (POST, PUT, DELETE) requieren autenticación con token JWT (en header `Authorization: Bearer <token>`).
- Las respuestas de error tienen el formato:
  ```json
  { "message": "Descripción del error", "error": "detalle" }
  ```
- El backend está desplegado en Render en:  
  https://mdw-2025-xnah.onrender.com

---
