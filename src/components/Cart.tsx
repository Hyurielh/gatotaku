import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';

export function Cart() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart } = useCart();
  const location = useLocation();

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

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-colors"
        aria-label="Abrir carrito"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </div>
      </button>

      {/* Modal del carrito */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold flex items-center">
                    <ShoppingCart className="mr-2" />
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
                
                {/* Contenido del carrito */}
                <div className="flex-grow overflow-y-auto p-4">
                  {items.length === 0 ? (
                    <p className="text-center text-gray-500">Tu carrito está vacío</p>
                  ) : (
                    items.map((item) => (
                      <div 
                        key={item.product.id} 
                        className="flex items-center justify-between border-b py-2"
                      >
                        <div className="flex items-center">
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-16 h-16 object-cover mr-4"
                          />
                          <div>
                            <h3 className="font-bold">{item.product.name}</h3>
                            <p>C${item.product.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded-l"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 bg-gray-100">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 bg-gray-200 rounded-r"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus size={16} />
                          </button>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total y botón de orden */}
                {items.length > 0 && (
                  <div className="p-4 border-t">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold">Total:</span>
                      <span>C${total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleOrder}
                      className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Ordenar por WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
