/* eslint-disable no-unused-vars */
import React from 'react';
import { Button, Col, Input, message, Row, Select, Table } from 'antd';
import { Option } from 'antd/lib/mentions';
import { connect, useDispatch } from 'react-redux';
import {
	getRequest,
	resetStudentRequestModel,
} from '../../features/requestStudentSlice/requestStudentSlice';
import moment from 'moment/moment';
import requestApi from '../../API/requestStudent';
import { sendMessageDevice } from '../../ultis/PushNotifi';
import { statusRequestStudent } from '../../ultis';

const ListConfirmStudent = (props) => {
	const { data } = props;
	const dispatch = useDispatch();
	React.useEffect(() => {
		dispatch(getRequest());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const columns = [
		{
			title: 'Tên sinh viên',
			dataIndex: ['userId', 'name'],
			key: 'name',
		},
		{
			title: 'Loại',
			dataIndex: 'type',
			key: 'description',
			render: (val) => {
				if (val === 'narrow') {
					return 'Form CV';
				} else if (val === 'form') {
					return 'Form biểu mẫu';
				} else {
					return 'Form báo cáo';
				}
			},
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (val) => moment(val).format('DD/MM/YYYY'),
		},
		{
			title: 'Hành Động',
			dataIndex: '',
			key: 'x',
			render: (val, record) => {
				switch (record.status) {
					case statusRequestStudent.PENDING:
						return (
							<>
								<Button
									danger
									onClick={() => onCancel(record._id)}
									style={{
										marginRight: '20px',
									}}
								>
									Huỷ
								</Button>
								<Button type="primary" onClick={() => onComfirm(record)}>
									Xác Nhận
								</Button>
							</>
						);
					// eslint-disable-next-line no-duplicate-case
					case statusRequestStudent.ACCEPT:
						return (
							<>
								<span>Đã hỗ trợ</span>
							</>
						);
					// eslint-disable-next-line no-duplicate-case
					case statusRequestStudent.PENDING:
						return (
							<>
								<span>Đã từ chối</span>
							</>
						);
					default:
						break;
				}
			},
		},
	];

	const onComfirm = (value) => {
		const data = {
			id: value._id,
			type: value.type,
			userId: value.userId._id,
		};
		sendMessageDevice(value.userId, 'yêu cầu chỉnh sửa của bạn đã được cán bộ xác nhận');
		dispatch(
			resetStudentRequestModel({
				val: data,
				callback: callback,
			})
		);
	};
	const onCancel = (value) => {
		requestApi.removeRequestApi(value).then((res) => callback(res.data));
	};
	const callback = (res) => {
		if (res.success) {
			dispatch(getRequest());

			message.success(res.message);
		} else {
			message.error(res.message);
		}
	};
	const handleChange = (value) => {
		const id = value._id;
	};
	return (
		<>
			<Row>
				<Col xs={24} sm={24} md={24} lg={8} span={8}>
					<h2
						style={{
							color: 'black',
						}}
						className="mb-2"
					>
						Danh sách sinh viên
					</h2>
				</Col>
				<Col xs={24} sm={12} md={12} lg={8} xl={8}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<span style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>Tìm Kiếm:</span>
						<Input style={{ width: '100%' }} placeholder="Tìm kiếm theo mã sinh viên" />
					</div>
				</Col>
				<Col xs={24} sm={12} md={12} lg={8} xl={8}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<span style={{ whiteSpace: 'nowrap', marginRight: '10px' }}>
							Trạng Thái:
						</span>
						<Select
							placeholder="Lọc theo trạng thái"
							style={{ width: 180 }}
							onChange={handleChange}
						>
							<Option value="1">Chờ xác nhận</Option>
							<Option value="2">Đã xác nhận</Option>
						</Select>
					</div>
				</Col>
			</Row>
			<Table
				columns={columns}
				expandable={{
					rowExpandable: (record) => record.name !== 'Not Expandable',
				}}
				dataSource={data}
			/>
		</>
	);
};

export default connect(({ request }) => ({
	data: request.data,
}))(ListConfirmStudent);
