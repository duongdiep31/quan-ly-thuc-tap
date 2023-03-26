import { UploadOutlined } from '@ant-design/icons';
import { Input, Button, message, Spin, Form, Upload, DatePicker } from 'antd';
import { object } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import ReportFormAPI from '../../API/ReportFormAPI';
import CountDownCustorm from '../../components/CountDownCustorm';
import { sendMessageDevice } from '../../ultis/PushNotifi';
import { getStudentId } from '../../features/StudentSlice/StudentSlice';
import { getTimeForm } from '../../features/timeDateSlice/timeDateSlice';
import { getLocal } from '../../ultis/storage';

import styles from './Form.module.css';

const formItemLayout = {
	labelCol: {
		xs: {
			span: 24,
		},
		sm: {
			span: 8,
		},
	},
	wrapperCol: {
		xs: {
			span: 24,
		},
		sm: {
			span: 16,
		},
	},
};
// const tailFormItemLayout = {
//   wrapperCol: {
//     xs: {
//       span: 24,
//       offset: 0,
//     },
//     sm: {
//       span: 16,
//       offset: 8,
//     },
//   },
// };
const Formrp = ({ studentById }) => {
	const infoUser = getLocal();
	const { time } = useSelector((state) => state.time.formTime);
	const [spin, setSpin] = useState(false);
	const [startDate, setStartDate] = useState();
	const [file, setFile] = useState();
	const [form] = Form.useForm();

	const mssv = infoUser.student?.mssv;
	const email = infoUser?.student?.email;
	const dispatch = useDispatch();
	const datePicker = (date, dateString) => {
		setStartDate(date._d);
	};

	useEffect(() => {
		dispatch(
			getTimeForm({
				typeNumber: 2,
				semester_id: infoUser.student?.smester_id,
				campus_id: infoUser.student?.campus_id,
			})
		);
		dispatch(getStudentId(infoUser));
	}, [dispatch, file]);

	function guardarArchivo(files, data) {
		const file = files; //the file
		const urlGGDriveCV = `https://script.google.com/macros/s/AKfycbzxKWUNnzXiG_VKSEXbYTeBppWHrSzFUGCX431yK5rz7va85wFOZuunkiE2EJJfBaCg/exec
     `;

		var reader = new FileReader(); //this for convert to Base64
		reader.readAsDataURL(file); //start conversion...
		reader.onload = function (e) {
			//.. once finished..
			var rawLog = reader.result.split(',')[1]; //extract only thee file data part
			var dataSend = {
				dataReq: { data: rawLog, name: file.name, type: file.type },
				fname: 'uploadFilesToGoogleDrive',
			}; //preapre info to send to API
			fetch(
				urlGGDriveCV, //your AppsScript URL
				{ method: 'POST', body: JSON.stringify(dataSend) }
			) //send to Api
				.then((res) => res.json())
				.then((a) => {
					const newData = { ...data, form: a.url };
					ReportFormAPI.uploadForm(newData)
						.then((res) => {
							message.success(res.data.message);
							setFile('');
							form.resetFields();
							sendMessageDevice(infoUser, 'nộp biểu mẫu thành công');
						})
						.catch((err) => {
							const dataErr = err.response.data;
							if (!dataErr.status) {
								message.error(`${dataErr.message}`);
								form.resetFields();
							} else {
								message.error(`${dataErr.message}`);
							}
						});
					setSpin(false);
				})
				.catch((e) => {
					message.success('Có lỗi xảy ra! Vui lòng đăng ký lại');
					form.resetFields();
					setSpin(false);
				}); // Or Error in console
		};
	}

	const props = {
		beforeUpload: (file) => {
			const isFile =
				file.type === 'application/pdf' ||
				file.type === 'image/jpeg' ||
				file.type === 'image/jpg' ||
				file.type ===
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
			if (!isFile) {
				message.error(`${file.name} không phải là file PDF hoặc ảnh`);
			}

			return isFile || Upload.LIST_IGNORE;
		},
		onChange: (info) => {
			setFile(info.file.originFileObj);
		},
	};

	let timeCheck = time;
	if (studentById.listTimeForm && studentById.listTimeForm.length > 0) {
		const checkTimeStudent = studentById.listTimeForm.find((item) => item.typeNumber === 2);
		if (checkTimeStudent) {
			timeCheck = checkTimeStudent;
		}
	}

	const check =
		timeCheck &&
		timeCheck.endTime > new Date().getTime() &&
		timeCheck.startTime < new Date().getTime();
	const isCheck =
		(studentById && studentById?.statusCheck === 2) || studentById?.statusCheck === 5;
	const nameCompany = studentById.support === 0 ? studentById.nameCompany : studentById.business;
	const onFinish = async (values) => {
		setSpin(true);
		try {
			const newData = {
				...values,
				mssv: mssv,
				email: email,
				typeNumber: time.typeNumber,
				internshipTime: startDate,
				semester_id: infoUser.student.smester_id,
				checkTime: check,
				campus_id: infoUser.student?.campus_id,
				_id: infoUser.student._id,
			};

			if (values.upload === undefined || values.upload === null) {
				message.error('Vui lòng tải file Biên bản định dạng PDF của bạn lên FORM biên bản');
				setSpin(false);
				return;
			}
			await guardarArchivo(file, newData);
		} catch (error) {
			const dataErr = await error.response.data;
			message.error(dataErr.message);
		}
	};
	const config = {
		rules: [
			{
				type: 'object',
				required: true,
				message: 'Vui lòng nhập ngày bắt đầu thực tập!',
			},
		],
	};

	const configNameCompany = {
		rules: [
			{
				required: true,
				message: 'Vui lòng nhập tên doanh nghiệp',
			},
		],
	};
	return (
		<>
			{check ? (
				isCheck ? (
					<>
						{' '}
						{check && <CountDownCustorm time={timeCheck} />}
						<Spin spinning={spin}>
							<Form
								{...formItemLayout}
								className={styles.form}
								name="register"
								onFinish={onFinish}
							>
								{nameCompany ? null : (
									<Form.Item
										name="nameCompany"
										label="Tên doanh nghiệp"
										{...(nameCompany ? null : configNameCompany)}
									>
										<Input placeholder="Tên doanh nghiệp" />
									</Form.Item>
								)}
								<Form.Item label="Mã sinh viên">
									<p className={styles.text_form_label}>{studentById.mssv}</p>
								</Form.Item>
								<Form.Item label="Họ và Tên">
									<p className={styles.text_form_label}>{studentById.name}</p>
								</Form.Item>
								<Form.Item
									name="internshipTime"
									label="Thời gian bắt đầu thực tập"
									{...config}
								>
									<DatePicker onChange={datePicker} placeholder="Bắt đầu" />
								</Form.Item>
								<Form.Item
									name="upload"
									label="Upload biên bản (Image, PDF hoặc Docx)"
									valuePropName="upload"
								>
									<Upload {...props} maxCount={1}>
										<Button icon={<UploadOutlined />}>Click to upload</Button>
									</Upload>
								</Form.Item>
								<Form.Item
									wrapperCol={{
										xs: {
											span: 24,
											offset: 0,
										},
										sm: {
											span: 16,
											offset: 8,
										},
									}}
								>
									<Button type="primary" htmlType="submit">
										Submit
									</Button>
								</Form.Item>
							</Form>
						</Spin>
					</>
				) : studentById.statusCheck === 3 ? (
					'Sinh viên đã trượt kỳ thực tập. Chúc em sẽ cố gắng hơn vào kỳ thực tập sau'
				) : studentById.statusCheck === 9 ? (
					'Chúc mừng sinh viên đã hoàn thành kỳ thực tập'
				) : studentById.statusCheck === 4 ? (
					'Bạn đã nộp biên bản thành công.'
				) : (
					'Bạn đã nộp biên bản thành công.'
				)
			) : (
				<p>Chưa đến thời gian nộp biên bản</p>
			)}
		</>
	);
};
Formrp.propTypes = {
	infoUser: object,
	studentById: object,
};

export default connect(({ students: { studentById } }) => ({
	studentById,
}))(Formrp);
