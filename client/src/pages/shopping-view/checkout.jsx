import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import Address from "@/components/shopping-view/address";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import img from "../../assets/account.jpg";

// Load Stripe
const stripePromise = loadStripe("pk_test_51PhPc4RpGCn2fSqCob2WjUgZKxxGNp26Qz9v3tRI1RjLgqnundiBiwUFQCJfan8kAyAkqzv50aGZQf21QLYbFq3a005F1XrdBc");

function CheckoutForm({ totalCartAmount, cartItems, currentSelectedAddress, handlePlaceOrder }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Stripe is not loaded yet. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }

    // You can send the paymentMethod.id to your backend for further processing.
    handlePlaceOrder(paymentMethod.id);
  }

  return (
    <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
      <CardElement className="border p-2 rounded-md" />
      <Button type="submit" className="w-full" disabled={!stripe}>
        Pay ${totalCartAmount}
      </Button>
    </form>
  );
}

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items?.length > 0
      ? cartItems.items.reduce(
          (sum, item) =>
            sum + (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
          0
        )
      : 0;

  function handlePlaceOrder(paymentMethodId) {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Please select an address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "placed",
      paymentMethod: "card",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      paymentMethodId, // Include paymentMethodId from Stripe
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Order placed successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to place the order. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items?.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                totalCartAmount={totalCartAmount}
                cartItems={cartItems}
                currentSelectedAddress={currentSelectedAddress}
                handlePlaceOrder={handlePlaceOrder}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
