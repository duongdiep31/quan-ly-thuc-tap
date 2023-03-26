import { UploadOutlined } from '@ant-design/icons';
import { Form, Button, message, Spin, Space, DatePicker, Upload, InputNumber, Radio } from 'antd';
import moment from 'moment';
import { object } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import ReportFormAPI from '../../API/ReportFormAPI';
import CountDownCustorm from '../../components/CountDownCustorm';
import { sendMessageDevice } from '../../ultis/PushNotifi';
import { getStudentId } from '../../features/StudentSlice/StudentSlice';
import { getTimeForm } from '../../features/timeDateSlice/timeDateSlice';
import { signTheContractValues } from '../../ultis';
import styles from './ReportForm.module.css';

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
const tailFormItemLayout = {
	wrapperCol: {
		xs: {
			span: 24,
			offset: 0,
		},
		sm: {
			span: 16,
			offset: 8,
		},
	},
};

const ReportForm = ({ infoUser, studentById }) => {
	const { time } = useSelector((state) => state.time.formTime);

	const [spin, setSpin] = useState(false);
	const [file, setFile] = useState();
	const [endDate, setEndDate] = useState();
	const [form] = Form.useForm();

	const lForm = studentById.CV;
	const dispatch = useDispatch();
	const datePicker = (date, dateString) => {
		setEndDate(date._d);
	};
	useEffect(() => {
		dispatch(
			getTimeForm({
				typeNumber: 3,
				semester_id: infoUser.student?.smester_id,
				campus_id: infoUser.student?.campus_id,
			})
		);
		dispatch(getStudentId(infoUser));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, file]);
	function guardarArchivo(files, data) {
		const file = files; //the file
		const urlGGDriveCV = `https://script.google.com/macros/s/AKfycbzu7yBh9NkX-lnct-mKixNyqtC1c8Las9tGixv42i9o_sMYfCvbTqGhC5Ps8NowC12N/exec
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
					const newData = { ...data, report: a.url };
					ReportFormAPI.uploadReport(newData)
						.then((res) => {
							message.success(res.data.message);
							form.resetFields();
							setSpin(false);
							sendMessageDevice(infoUser, 'nộp báo cáo thành công');
							setFile('');
						})
						.catch(async (err) => {
							const dataErr = await err.response.data;
							if (!dataErr.status) {
								message.error(`${dataErr.message}`);
								form.resetFields();
							} else {
								message.error(`${dataErr.message}`);
							}
							setSpin(false);
						});
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
				file.type ===
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
			if (!isFile) {
				message.error(`${file.name} không phải là file PDF hoặc Docx`);
			}

			return isFile || Upload.LIST_IGNORE;
		},
		onChange: (info) => {
			setFile(info.file.originFileObj);
		},
	};

	let timeCheck = time;
	if (studentById.listTimeForm && studentById.listTimeForm.length > 0) {
		const checkTimeStudent = studentById?.listTimeForm.find((item) => item.typeNumber === 3);
		if (checkTimeStudent) {
			timeCheck = checkTimeStudent;
		}
	}

	const check =
		timeCheck &&
		timeCheck.endTime > new Date().getTime() &&
		timeCheck.startTime < new Date().getTime();
	const isCheck = studentById.statusCheck === 6 || studentById.statusCheck === 8;
	const onFinish = async (values) => {
		setSpin(true);
		try {
			const newData = {
				EndInternShipTime: endDate,
				mssv: studentById.mssv,
				typeNumber: time.typeNumber,
				email: studentById.email,
				business: studentById.business,
				attitudePoint: values.attitudePoint,
				resultScore: values.resultScore,
				semester_id: infoUser.student.smester_id,
				campus_id: infoUser.student.campus_id,
				checkTime: check,
				_id: infoUser.student._id,
				signTheContract: values.signTheContract,
			};

			if (values.upload === undefined || values.upload === null) {
				message.error(
					'Vui lòng tải file Báo cáo định dạng PDF hoặc Docx của bạn lên FORM biên bản'
				);
				setSpin(false);
				return;
			}
			await guardarArchivo(file, newData);
		} catch (error) {
			const dataErr = await error.response.data;
			setSpin(false);
			message.error(dataErr.message);
		}
	};
	const dateFormat = 'YYYY-MM-DD';
	function disabledDate(current) {
		// Can not select days before today and today
		return current && current < moment(studentById.internshipTime).add(1, 'day');
	}

	const config = {
		rules: [
			{
				type: 'object',
				required: true,
				message: 'Vui lòng nhập ngày kết thúc thực tập!',
			},
		],
	};

	return (
		<>
			{check ? (
				isCheck ? (
					<>
						{check && <CountDownCustorm time={timeCheck} />}
						<Spin spinning={spin}>
							<Form
								{...formItemLayout}
								className={styles.form}
								name="register"
								onFinish={onFinish}
							>
								<Form.Item label="Họ và Tên">
									<p className={styles.text_form_label}>{studentById.name}</p>
								</Form.Item>
								<Form.Item label="Mã sinh viên">
									<p className={styles.text_form_label}>
										{studentById.mssv.toUpperCase()}
									</p>
								</Form.Item>
								<Form.Item name="nameCompany" label="Tên doanh nghiệp">
									<p className={styles.text_form_label}>
										{studentById?.business
											? studentById?.business?.name.toUpperCase()
											: studentById?.nameCompany.toUpperCase()}
									</p>
								</Form.Item>
								<Form.Item
									name="resultScore"
									label="Điểm kết quả"
									help="Vui lòng nhập điểm phẩy bằng dấu chấm VD: 9.5."
									rules={[
										{
											required: true,
											message: 'Vui lòng nhập điểm kết quả thực tập',
										},
									]}
								>
									<InputNumber
										style={{
											width: '50%',
										}}
										min={0}
										max={10}
										placeholder="Nhập điểm kết quả thực tập"
									/>
								</Form.Item>
								<Form.Item
									name="attitudePoint"
									label="Điểm thái độ"
									help="Vui lòng nhập điểm phẩy bằng dấu chấm VD: 9.5."
									rules={[
										{
											required: true,
											message: 'Vui lòng nhập điểm thái độ',
										},
									]}
								>
									<InputNumber
										style={{
											width: '50%',
										}}
										min={0}
										max={10}
										placeholder="Nhập điểm thái độ thực tập"
									/>
								</Form.Item>

								<Form.Item
									name="signTheContract"
									label="Đề xuất kí HĐLĐ với Doanh nghiệp"
									help="Vui lòng nhập điểm phẩy bằng dấu chấm VD: 9.5."
									rules={[
										{
											required: true,
											message: 'Vui lòng chọn câu trả lời',
										},
									]}
								>
									<Radio.Group>
										{signTheContractValues.map((res, i) => (
											<Radio value={res.type} key={i}>
												{res.value}
											</Radio>
										))}
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label="Thời gian bắt đầu thực tập"
									// rules={[{}]}
								>
									<Space direction="vertical">
										<DatePicker
											defaultValue={moment(
												studentById.internshipTime,
												dateFormat
											)}
											disabled
											placeholder="Bắt đầu thực tập"
										/>
									</Space>
								</Form.Item>
								<Form.Item
									name="internshipTime"
									label="Thời gian kết thúc thực tập"
									{...config}
								>
									<DatePicker
										onChange={datePicker}
										disabledDate={disabledDate}
										placeholder="Kết thúc"
									/>
								</Form.Item>
								<Form.Item
									name="upload"
									label="Upload báo cáo (Docx hoặc PDF)"
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
									{...tailFormItemLayout}
								>
									<Button type="primary" htmlType="submit">
										Submit
									</Button>
									<Button
										style={{
											margin: '0 5px 0',
										}}
										type="link"
										onClick={() => window.open(lForm)}
									>
										Xem CV
									</Button>
								</Form.Item>
							</Form>
						</Spin>
					</>
				) : studentById.statusCheck === 3 ? (
					'Sinh viên đã trượt kỳ thực tập. Chúc em sẽ cố gắng hơn vào kỳ thực tập sau'
				) : studentById.statusCheck === 9 ? (
					'Chúc mừng sinh viên đã hoàn thành kỳ thực tập'
				) : studentById.statusCheck === 7 ? (
					'Bạn đã nộp báo cáo thành công'
				) : (
					'Chưa đến thời gian nộp báo cáo'
				)
			) : (
				<p>Chưa đến thời gian nộp báo cáo</p>
			)}
		</>
	);
};

ReportForm.propTypes = {
	infoUser: object,
	studentById: object,
};

export default connect(({ auth: { infoUser }, students: { studentById } }) => ({
	infoUser,
	studentById,
}))(ReportForm);
