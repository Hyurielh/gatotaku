import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Cart() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart } = useCart();

  const handleOrder = () => {
    // Crear el mensaje para WhatsApp
    const message = items
      .map(
        item =>
          `• ${item.quantity}x ${item.product.name} - C$${(
            item.product.price * item.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    const totalMessage = `\n\nTotal: C$${total.toFixed(2)}`;
    const encodedMessage = encodeURIComponent(`¡Hola! Me gustaría ordenar:\n${message}${totalMessage}`);
    
    // Abrir WhatsApp
    window.open(`https://wa.me/50578364365?text=${encodedMessage}`, '_blank');
    clearCart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <ShoppingBag className="mr-2" />
          Carrito de Compras
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Cerrar carrito"
        >
          <X />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500">El carrito está vacío</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center space-x-4">
                <img
                  src={item.product.images[0] || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">
                    C${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label="Reducir cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Eliminar del carrito"
                >
                  <X />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t p-4 space-y-4">
          <div className="flex justify-between items-center font-semibold">
            <span>Total:</span>
            <span>C${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleOrder}
            className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-900 transition-colors"
          >
            Ordenar por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
