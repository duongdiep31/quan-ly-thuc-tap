import { Button, Form, Input, InputNumber, Select, Spin, message } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import CumpusApi from '../../API/Cumpus';
import majorAPI from '../../API/majorAPi';
import { useMutation } from 'react-query';
import BusinessAPI from '../../API/Business';
import SemestersAPI from '../../API/SemestersAPI';

const layout = {
	labelCol: {
		span: 8,
		style: { textAlign: 'left' },
	},
	wrapperCol: {
		span: 16,
	},
};

const validateMessages = {
	required: '${label} is required!',
	types: {
		email: '${label} is not a valid email!',
		number: '${label} is not a valid number!',
	},
	number: {
		range: '${label} must be between ${min} and ${max}',
	},
};

const FormBusiness = ({ paramsUpdate, closeVisible, visible }) => {
	const [defaultValues, setDefaultValues] = useState();

	const [form] = Form.useForm();
	const { val, type } = paramsUpdate;

	// Lấy ra thông tin các chuyên ngành của trường
	const { data: dataMajors, isLoading: isLoadingMajor } = useQuery('majors', () => {
		return majorAPI.getList();
	});

	// Lấy ra các cơ sở của trường
	const { data: dataCampus, isLoading: isLoadingCampus } = useQuery('campus', () => {
		return CumpusApi.getList();
	});

	// data này đang không nhận được dữ liệu
	const { data: dataSmester, isLoading: isLoadingSmester } = useQuery('Smester', () => {
		return SemestersAPI.getSemesters();
	});

	// api gọi để create doanh nghiệp
	const fetchCreateBusiness = (params) => {
		return BusinessAPI.create(params);
	};

	// api chỉnh sửa dữ liệu doanh nghiệp
	const fetchUpdateBusiness = (params) => {
		return BusinessAPI.update(params);
	};

	// lấy ra thông tin 1 doanh nghiệp
	const fetchBusinessItem = (params) => {
		return BusinessAPI.getItem(params);
	};

	// được gọi khi featch được api về thành công và setStateDefaultValue ( trường hợp chình sửa )
	const getSuccessItem = (data) => {
		setDefaultValues({
			address: data.address,
			amount: data.amount,
			campus_id: data.campus_id,
			code_request: data.code_request,
			description: data.description,
			internshipPosition: data.internshipPosition,
			majors: data.majors,
			name: data.name,
			request: data.request,
			smester_id: data.smester_id,
			benefish: data.benefish,
		});
	};

	// gọi api lấy thông tin chi tiết 1 doanh nghiệp
	const { data, isLoading } = useQuery(
		['businessItem', val, visible],
		() => fetchBusinessItem(val),
		{
			enabled: type,
			keepPreviousData: visible,
			onSuccess: (data) => getSuccessItem(data?.data?.itemBusiness),
			onError: () => console.log('loi'),
		}
	);

	// thêm mới 1 sản phẩm
	const mutationCreate = useMutation('businessCreate', fetchCreateBusiness, {
		onSuccess: async (res) => {
			await message.success(res.data?.message);
			closeVisible();
		},
	});

	// chỉnh sửa thông tin doanh nghiệp
	const mutationUpdate = useMutation(['businessUpdate'], fetchUpdateBusiness, {
		onSuccess: async (res) => {
			await message.success(res.data?.message);
			closeVisible();
		},
	});

	// function xử lý submit form
	const onFinish = (values) => {
		const data = {
			address: values.address?.trim(),
			amount: values.amount,
			campus_id: values.campus_id?.trim(),
			code_request: values.code_request?.trim(),
			description: values.description?.trim(),
			internshipPosition: values.internshipPosition?.trim(),
			majors: values.majors?.trim(),
			name: values.name?.trim(),
			request: values.request?.trim(),
			smester_id: values.smester_id?.trim(),
			benefish: values.benefish.trim(),
		};

		// type quyết định function sẽ thực hiện update || create
		type ? mutationUpdate.mutate({ ...data, val }) : mutationCreate.mutate(data);
	};

	useEffect(() => {
		if (!type) {
			setDefaultValues({
				address: '',
				amount: '',
				campus_id: '',
				code_request: '',
				description: '',
				internshipPosition: '',
				majors: '',
				name: '',
				request: '',
				smester_id: '',
				benefish: '',
			});
		}
	}, [type]);

	useEffect(() => {
		form.resetFields();
	}, [defaultValues]);

	return (
		<>
			<Form
				{...layout}
				name="nest-messages"
				onFinish={onFinish}
				form={form}
				validateMessages={validateMessages}
				initialValues={defaultValues}
			>
				{!type && (
					<Form.Item label="Kỳ học">
						<span>{dataSmester?.data?.defaultSemester?.name}</span>
					</Form.Item>
				)}

				{type && (
					<Form.Item
						label="Kỳ học"
						name={['smester_id']}
						rules={[
							{
								required: true,
							},
						]}
					>
						<Select disabled={true}>
							{isLoadingSmester ? (
								<Spin />
							) : (
								dataSmester?.data?.listSemesters.map((semester) => (
									<Select.Option key={semester._id} value={semester._id}>
										{semester.name}
									</Select.Option>
								))
							)}
						</Select>
					</Form.Item>
				)}

				<Form.Item
					name={['name']}
					label="Tên doanh nghiệp"
					rules={[
						{
							required: true,
							pattern: new RegExp('.*\\S+.*'),
							message: 'Vui lòng nhập tên doanh nghiệp',
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name={['code_request']}
					label="Mã doanh nghiệp"
					rules={[
						{
							required: true,
							pattern: new RegExp('.*\\S+.*'),
							message: 'Vui lòng nhập mã doanh nghiệp',
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name={['internshipPosition']}
					label="Vị trí thực tập"
					rules={[
						{
							required: true,
							pattern: new RegExp('.*\\S+.*'),
							message: 'Vui lòng nhập vị trí tuyển thực tập',
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name={['address']}
					label="Địa chỉ thực tập"
					rules={[
						{
							required: true,
							pattern: new RegExp('.*\\S+.*'),
							message: 'Vui lòng nhập địa chỉ thực tập',
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item name={['request']} label="Yêu cầu từ doanh nghiệp">
					<Input.TextArea />
				</Form.Item>

				<Form.Item name={['benefish']} label="Quyền lợi">
					<Input.TextArea />
				</Form.Item>

				<Form.Item name={['description']} label="Chi tiết khi làm việc tại doanh nghiệp">
					<Input.TextArea />
				</Form.Item>
				<Form.Item
					label="Chuyên ngành học"
					name={['majors']}
					rules={[
						{
							required: true,
							message: 'Vui lòng chọn chuyên ngành học',
						},
					]}
				>
					<Select>
						{isLoadingMajor ? (
							<Spin />
						) : (
							dataMajors?.data?.majors?.map((major) => (
								<Select.Option key={major._id} value={major._id}>
									{major.name}
								</Select.Option>
							))
						)}
					</Select>
				</Form.Item>

				<Form.Item
					label="Cơ sở FPT Poly"
					name={['campus_id']}
					rules={[
						{
							required: true,
							message: 'Vui lòng chọn Cở sở FPT Poly',
						},
					]}
				>
					<Select>
						{isLoadingCampus ? (
							<Spin />
						) : (
							dataCampus?.data?.listCumpus?.map((campus) => (
								<Select.Option key={campus._id} value={campus._id}>
									{campus.name}
								</Select.Option>
							))
						)}
					</Select>
				</Form.Item>

				<Form.Item
					name={['amount']}
					label="Số lượng tuyển dụng của doanh nghiệp"
					rules={[
						{
							type: 'number',
							min: 0,
							max: 99,
							required: true,
							message: 'Số lượng tuyển dụng nhỏ phải >= 0 or <= 99',
						},
					]}
				>
					<InputNumber />
				</Form.Item>

				<Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
					<Button type="primary" htmlType="submit">
						Submit
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};

export default memo(FormBusiness);
