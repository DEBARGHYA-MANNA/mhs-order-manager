'use client';
import { useParams } from 'next/navigation';
import OrderForm from '../../../../components/OrderForm/OrderForm';

export default function EditOrderClient() {
    const { id } = useParams();
    return <OrderForm mode="edit" orderId={id} />;
}