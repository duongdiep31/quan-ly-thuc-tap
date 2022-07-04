import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Table,
} from "antd";
import { Option } from "antd/lib/mentions";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { getListMajor } from "../../features/majorSlice/majorSlice";
import { createNarrows, getNarow, updateNarow } from "../../features/narrow";
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const Narrows = ({ isMobile }) => {
  const dispatch = useDispatch();
  const [hideForm, setHideForm] = useState(false);
  const [change, setChange] = useState(false);
  const [text, setText] = useState("add");
  const [form] = Form.useForm();
  const { listMajor } = useSelector((state) => state.major);
  const { listNarrow, loadings } = useSelector((state) => state.narrow);
  const columns = [
    {
      dataIndex: "id",
      width: 20,
    },
    {
      title: "Tên ngành hẹp",
      dataIndex: "name",
      width: 100,
    },
    {
      title: "Mã ngành học",
      dataIndex: "id_majors",
      width: 100,
      render: (val) => val?.name,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="text"
            style={{ color: "blue" }}
            href="#"
            onClick={() => getDataEdit("update", record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];
  const getDataEdit = (key, val) => {
    setText(key);
    setHideForm(true);
    switch (key) {
      case "update":
        setChange(val);
        form.setFieldsValue({
          name: val.name,
          id_majors: val?.id_majors?._id,
        });
        break;
      case "add":
        setHideForm(true);
        break;
      default:
        break;
    }
  };

  const onClose = () => {
    setChange({});
    form.resetFields();
    setHideForm(false);
    setText("Thêm")
  };
  useEffect(() => {
    dispatch(getListMajor());
    dispatch(getNarow());
  }, [dispatch]);
  const onFinish = async (values) => {
    const data = {
      ...values,
      _id: change._id,
    };
    try {
      if (text.toLowerCase() === "update") {
        dispatch(
          updateNarow({
            data: data,
            callback: cbHandleAdd
          })
        );
      } else {
        dispatch(createNarrows({ data:data, callback: cbHandleAdd }));
      }
      setHideForm(false);
    } catch (error) {
      const dataErr = error.response.data.message;
      message.error(dataErr);
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
    setText("add")
  };  // sửa ngành

  // Huỷ form

  // Bật tắt button tạo kỳ

  return (
    <>
      <div className="status">
        <div className="flex-header">
          <h4>Quản lý ngành hẹp</h4>
          <div style={{ display: "flex" }}>
            <Button
              onClick={() => getDataEdit("add", null)}
              variant="warning"
              type="primary"
              style={{ marginRight: 10, height: 36 }}
            >
              Tạo ngành hẹp
            </Button>
          </div>
        </div>
        <div className="filter" style={{ marginTop: "20px" }}>
          <Drawer
            destroyOnClose
            title={"Tạo ngành hẹp"}
            placement="left"
            onClose={onClose}
            visible={hideForm}
            width={!isMobile && 600}
          >
            <Form {...formItemLayout} form={form} onFinish={onFinish}>
              <Form.Item
                name="name"
                label="Tên ngành hẹp"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên ngành học!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name={"id_majors"}
                label={"Chọn ngành"}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngành học!",
                  },
                ]}
              >
                <Select className="select-branch" placeholder="Lọc theo ngành">
                  {listMajor &&
                    listMajor?.map((item, index) => (
                      <>
                        <Option value={item._id} key={index}>
                          {item.name}
                        </Option>
                      </>
                    ))}
                </Select>
              </Form.Item>

              <Button
                style={{
                  position: "absolute",
                  left: "35%",
                }}
                type="primary"
                htmlType="submit"
              >
                Xác nhận
              </Button>
            </Form>
          </Drawer>
        </div>
        <Table
          loading={loadings}
          dataSource={listNarrow && listNarrow.length > 0 ? listNarrow : []}
          columns={columns}
        />
      </div>
    </>
  );
};

export default connect(({ global }) => ({
  isMobile: global.isMobile,
}))(Narrows);
