/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Table, message, Space, Form, Input, Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMajor, getListMajor, updateMajor } from '../../features/majorSlice/majorSlice';
import { getLocal } from '../../ultis/storage';
const Major = () => {
  const dispatch = useDispatch();
  const infoUser = getLocal();
  const [hideForm, setHideForm] = useState(false);
  const [change, setChange] = useState(false);
  const [text, setText] = useState('Thêm ngành');
  const [form] = Form.useForm();
  const { listMajor, loading } = useSelector((state) => state.major);
  const columns = [
    {
      dataIndex: 'id',
      width: 20,
    },
    {
      title: 'Tên ngành học',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: 'Mã ngành học',
      dataIndex: 'majorCode',
      width: 100,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (text, record) => (
        <Space size="middle">
          <a style={{ color: 'blue' }} onClick={() => getDataEdit('update', record)}>
            Sửa
          </a>
        </Space>
      ),
    },
  ];
  useEffect(() => {
    dispatch(getListMajor());
  }, [dispatch]);
  const onFinish = async (values) => {
    const data = {
      ...values,
      campus_id: infoUser.manager.campus_id,
      _id: change._id,
    };
    if (text.toLowerCase() === 'update') {
      dispatch(
        updateMajor({
          data: data,
          callback: cbHandleAdd,
        }),
      );
    } else {
      dispatch(
        createMajor({
          data: data,
          callback: cbHandleAdd,
        }),
      );
    }
  };

  const cbHandleAdd = (status, mess) => {
    setHideForm(false);
    if (status === 'ok') {
      message.success(mess);
    } else {
      message.error(mess);
    }
    form.resetFields();
    setText('Thêm ngành')
  };
  // sửa ngành
  const getDataEdit = (key, value) => {
    setText(key);
    switch (key) {
      case 'update':
        setHideForm(true);
        setChange(value);
        form.setFieldsValue({
          name: value.name,
          majorCode: value.majorCode,
        });
        setText(key);
        break;
      default:
        break;
    }
  };

  // Huỷ form

  const onClose = () => {
    setChange({});
    form.resetFields();
    setHideForm(false);
    setText('Thêm ngành');
  };
  return (
    <>
      <div className="status">
        <div className="flex-header">
          <h4>Quản lý ngành học</h4>
          <div style={{ display: 'flex' }}>
            <Button
              onClick={() => setHideForm(true)}
              variant="warning"
              type="primary"
              style={{ marginRight: 10, height: 36 }}
            >
              Tạo ngành học
            </Button>
          </div>
        </div>
        <div className="filter" style={{ marginTop: '20px' }}>
          <Drawer title={text} placement="left" onClose={onClose} visible={hideForm}>
            <Form form={form} onFinish={onFinish}>
              <Form.Item
                name="name"
                label="Tên ngành học"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên ngành học!',
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name={'majorCode'}
                label={'Mã ngành học'}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mã ngành học!',
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Button
                style={{
                  position: 'absolute',
                  left: '35%',
                }}
                type="primary"
                htmlType="submit"
              >
                Xác nhận
              </Button>
            </Form>
          </Drawer>

          {/* <FormMajor
              onFinish={onFinish}
              dataEdit={change}
              editStatusButton={editStatusButton}
              text={text}
              forms={form}
              type={hideForm}
              listMajors={listMajor}
              onClose={onClose}
            /> */}
        </div>
        <Table loading={loading} dataSource={listMajor} columns={columns} />
      </div>
    </>
  );
};

export default Major;
