import DefaultLayout from "../components/defaultLayout"
import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button, Table, Modal, Form, Datepicker, Input, message, DatePicker } from "antd";
import {
    DeleteOutlined, EditOutlined, PlusCircleOutlined,
    MinusCircleOutlined
} from "@ant-design/icons";
import { SmileOutlined } from "@ant-design/icons"

const InstantCheckout = () => {
    const [addModalVisibility, setAddModalVisibility] = useState(false); // State to control visibility of add/edit modal
    const [editModalVisibility, setEditModalVisibility] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // State to store item being edited
    const [itemsData, setItemsData] = useState([]); // State to hold items data
    const [printBillModalVisibility, setPrintBillModalVisibility] = useState(false)
    const [addEditModalVisibility, setAddEditModalVisibility] = useState(false); // State to control visibility of add/edit modal
    const [formInitialValues, setFormInitialValues] = useState({
        name: "",
        price: "",
        quantity: ""

    });
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [taxModalVisible, setTaxModalVisible] = useState(false);
    const [enteredTax, setEnteredTax] = useState(0);
    const componentRef = useRef();


    const calculateSubtotal = async () => {
        setTaxModalVisible(false)
        const total = itemsData.reduce((acc, item) => acc + parseFloat(item.total), 0);
        const taxValue = parseFloat(enteredTax);
        setTax(taxValue);

        await new Promise(resolve => setSubtotal(total));
    };


    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });




    const deleteItem = (record) => {
        const updatedItemsData = itemsData.filter(item => item !== record); // Filter out the deleted item
        setItemsData(updatedItemsData); // Update the itemsData state without the deleted item
        message.success('Item deleted successfully'); // Display success message
    }

    // Function to handle form submission for adding items
    const onFinish = (values) => {
        const total = parseFloat(values.quantity) * parseFloat(values.price); // Calculate total
        const newItem = { ...values, total: total.toFixed(2) }; // Add total to the item
        setItemsData([...itemsData, newItem]); // Add the new item to the itemsData array
        setAddEditModalVisibility(false); // Hide add/edit modal
        message.success('Item added successfully'); // Display success message
    }

    const onFinishEdit = (values) => {
        setFormInitialValues({})
        const total = parseFloat(values.quantity) * parseFloat(values.price); // Calculate total
        const newItem = { ...values, total: total.toFixed(2) };
        const updatedItemsData = itemsData.map(item => (item === editingItem ? newItem : item));
        setItemsData(updatedItemsData); // Update the item in the itemsData array
        message.success('Item edited successfully'); // Display success message
        setEditingItem(null); // Reset editingItem state

        setEditModalVisibility(false) // Hide add/edit modal
    }

    const handleQuantityChange = (record, newQuantity) => {
        if (newQuantity >= 1) {
            const updatedItemsData = itemsData.map(item => {
                if (item === record) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            setItemsData(updatedItemsData);
        }
    };


    // Table columns configuration
    const columns = [
        { title: "Name", dataIndex: "name" },
        { title: "Price", dataIndex: "price" },

        {
            title: "Quantity", dataIndex: "quantity", render: (quantity, record) => (
                <div>

                    <PlusCircleOutlined onClick={() => handleQuantityChange(record, parseInt(record.quantity) + 1)} />
                    <b className="mx-3">{quantity}</b>
                    <MinusCircleOutlined className="mx-0" onClick={() => handleQuantityChange(record, parseInt(record.quantity) - 1)} />
                </div>
            )
        },
        { title: "Expiry Date", dataIndex: "expiry" },
        { title: "Total", dataIndex: "total" }, // Use the calculated total
        {
            title: 'Actions',
            dataIndex: '_id',
            render: (_id, record) => (
                <div className='d-flex'>
                    <EditOutlined className='mx-2' onClick={() => {
                        setEditingItem(record); // Set editingItem state to the current item being edited
                        setFormInitialValues(record); // Set formInitialValues to prefill the form fields
                        console.log(record);
                        setEditModalVisibility(true); // Show add/edit modal
                    }} />
                    <DeleteOutlined className='mx-2' onClick={() => deleteItem(record)} />
                </div>
            )
        }


    ];


    const billColumns = [
        { title: "Name", dataIndex: "name" },
        { title: "Expiry", dataIndex: "expiry" },
        // { title: "Price", dataIndex: "price" },
        // { title: "Quantity", dataIndex: "quantity" },
        {
            title: "Qty*Price",
            dataIndex: "total",
            render: (text, record) => {
                // const total = record.price * record.quantity;
                return ` ${record.quantity} * ${record.price}  `;
            }
        },

        { title: "Total", dataIndex: "total" }, // Use the calculated total
    ];



    return (
        <>
            <DefaultLayout>
                <div className='d-flex justify-content-between'>
                    <h3>Instant Checkout</h3>
                    <Button type='primary' onClick={() => setAddEditModalVisibility(true)}>Add Item</Button>
                </div>
                <Table columns={columns} dataSource={itemsData} />

                {/* Modal for adding items */}
                {addEditModalVisibility && (
                    <Modal
                        onCancel={() => setAddEditModalVisibility(false)} // Handle modal cancel
                        visible={addEditModalVisibility}
                        title={'Add New Item'}
                        footer={null}
                    >
                        <Form
                            layout='vertical'
                            onFinish={onFinish}

                        >
                            <Form.Item name='name' label="Name">
                                <Input placeholder='Enter product name' />
                            </Form.Item>
                            <Form.Item name='price' label="Price">
                                <Input placeholder='Enter the price per Kg or per Unit' />
                            </Form.Item>
                            <Form.Item name='quantity' label="Quantity">
                                <Input placeholder='Enter the Quantity' />
                            </Form.Item>
                            <Form.Item name='expiry' label="Expiry date">

                                <Input type="date" placeholder='Select the Date' />
                            </Form.Item>
                            <div className="d-flex justify-content-end">
                                <Button htmlType='submit' type="primary">Save</Button>
                            </div>
                        </Form>
                    </Modal>
                )}

                <Modal
                    onCancel={() => {
                        setEditingItem({}); setFormInitialValues({
                            name: "",
                            price: 0,
                            quantity: 0

                        }); setEditModalVisibility(false);
                    }}
                    visible={editModalVisibility}
                    title={'Edit Item'}
                    footer={null}
                >
                    <Form
                        layout='vertical'
                        onFinish={onFinishEdit}
                    >
                        <Form.Item name='name' label="Name" value={formInitialValues.name}>
                            <Input placeholder='Enter product name' />
                        </Form.Item>
                        <Form.Item name='price' label="Price" value={formInitialValues.price}>
                            <Input placeholder='Enter the price per Kg or per Unit' />
                        </Form.Item>
                        <Form.Item name='quantity' label="Quantity" value={formInitialValues.quantity}>
                            <Input placeholder='Enter the Quantity' />
                        </Form.Item>
                        <Form.Item name='expiry' label="Expiry date">
                            <Input type="date" placeholder='Select the Date' />
                        </Form.Item>
                        <div className="d-flex justify-content-end">
                            <Button htmlType='submit' type="primary">Save</Button>
                        </div>
                    </Form>
                </Modal>


                <div className="charge-cill-amount">
                    <h5>SubTotal : <b>{subtotal} Rs/-</b></h5>
                    <h5>Discount : <b>{((subtotal / 100) * tax).toFixed(2)} Rs/-</b></h5>
                    <hr />
                    <div className='d-flex justify-content-end '>
                        <Button type='primary' onClick={() => setTaxModalVisible(true)}>Calculate Grand Total</Button>
                        <Button type='primary' style={{ marginLeft: '10px' }} onClick={() => {
                            setTaxModalVisible(true);
                            calculateSubtotal();
                            setPrintBillModalVisibility(true)
                        }}>Print</Button>
                    </div>
                    <h3>Grand Total : <b>{((subtotal - ((subtotal / 100) * tax)).toFixed(2))} Rs/-</b></h3>
                </div>




                {/* Tax input modal */}
                <Modal
                    visible={taxModalVisible}
                    onCancel={() => setTaxModalVisible(false)}
                    onOk={calculateSubtotal}
                    title="Enter Discount"
                >
                    <Input
                        placeholder="Enter Discount Percentage"
                        value={enteredTax}
                        onChange={(e) => setEnteredTax(e.target.value)}
                    />
                </Modal>


                <Modal onCancel={() => { setPrintBillModalVisibility(false) }} visible={printBillModalVisibility}
                    title={"BILL"} footer={false} width={'100mm'} bodyStyle={{ padding: 0 }}>


                    <div className='bill-model ' ref={componentRef}>

                        <div className='text-center'>
                            <div>
                                <h1><b>Gayatri Pharmacy</b></h1>
                            </div>
                            <div>
                                <p>Chipyana Buzurg, Ghaziabad </p>
                                <p>Uttar Pradesh, 201001</p>
                                <p>+91-9891802893</p>
                            </div>
                        </div>
                        <div className='bill-customer-details mt-3'>
                            <p><b>Date</b>: {new Date().toLocaleString()}</p>
                        </div>
                        <Table dataSource={itemsData} columns={billColumns} pagination={false} style={{ fontSize: '14px' }}></Table>


                        <div className='dotted-border mt-2 pb-2'>
                            <p><b>Sub Total</b> : {subtotal} Rs/-</p>
                            <p><b>Tax</b> : {((subtotal / 100) * tax).toFixed(2)} Rs/-</p>
                        </div>

                        <div className='mt-2'>
                            <h5><b>Grand Total : {((subtotal - ((subtotal / 100) * tax)).toFixed(2))} Rs/-</b></h5>
                        </div>

                        <div className='dotted-border mt-2 pb-2'></div>

                        <div className='text-center'>
                            <p>Thankyou! Have a nice day</p>
                            <p>Visit Again</p>
                            <p><SmileOutlined /> <SmileOutlined /> <SmileOutlined /> <SmileOutlined /></p>
                        </div>
                    </div>
                    <div className='d-flex justify-content-end'>
                        <Button type='primary' onClick={handlePrint}>Print</Button>

                    </div>





                </Modal>


            </DefaultLayout>
        </>
    )
}

export default InstantCheckout;
