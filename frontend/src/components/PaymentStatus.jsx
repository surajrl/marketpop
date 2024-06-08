"use client";

import { getOrderPaymentStatus } from "@/api/order";
import { useEffect, useState } from "react";

export default function PaymentStatus() {
  const [paymentStatus, setPaymentStatus] = useState(false);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const status = await getOrderPaymentStatus();
      setPaymentStatus(status);
    };

    let intervalId;
    if (!paymentStatus) {
      intervalId = setInterval(fetchPaymentStatus, 1000); // Poll every second
    } else {
      clearInterval(intervalId); // Stop the interval if paymentStatus is true
    }

    return () => clearInterval(intervalId);
  }, [paymentStatus]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Shipping to</p>
        <p>Casa 30, Paseo del Club Deportivo N2</p>
        <p>Pozuelo de Alarcon, 28223</p>
        <p>Madrid</p>
        <p>España</p>
      </div>

      <div>
        <p className="font-medium text-gray-900">Order status</p>
        <p>{paymentStatus ? "Payment successful" : "Payment pending"}</p>
      </div>
    </div>
  );
}
