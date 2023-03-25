import { EditOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	DatePicker,
	Input,
	message,
	Modal,
	Row,
	Select,
	Spin,
	Form,
	InputNumber,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StudentAPI from '../../API/StudentAPI';
import { getListTime } from '../../features/timeDateSlice/timeDateSlice';
import moment from 'moment';
import { statusConfigCV, statusConfigForm, statusConfigReport } from '../../ultis/constConfig';
import './studentDetail.css';
import { getBusiness } from '../../features/businessSlice/businessSlice';
import { fetchManager } from '../../features/managerSlice/managerSlice';
import { sendMessageDevice } from '../PushNotifi';
const optionCheck = [1, 5, 8, 3];
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY hh:mm:ss';
const dateFormatInput = 'YYYY/MM/DD';
const StudentDetail = (props) => {
	const { studentId, closeModal, infoUser } = props;
	const {
		formTime: { times },
	} = useSelector((state) => state.time);
	const [student, setStudent] = useState({});
	const [isShowSelectStatus, setIsShowSelectStatus] = useState(false);
	const [isEditReviewer, setIsEditReviewer] = useState(false);
	const [isEditBusiness, setIsEditBusiness] = useState(false);
	const [submitStatus, setSubmitStatus] = useState(false);
	const [statusUpdate, setStatusUpdate] = useState(0);
	const [isShowNote, setIsShowNote] = useState(false);
	const [note, setNote] = useState('');
	const [isSetNote, setIsSetNote] = useState(false);
	const [noteDetail, setNoteDetail] = useState('');
	const [listOption, setListOption] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [timeStudent, setTimeStudent] = useState({});
	const { listBusiness } = useSelector((state) => state.business);
	const { listManager } = useSelector((state) => state.manager);
	const [date, setDate] = useState(null);
	const [fieldStudent, setFieldStudent] = useState('');
	const dispatch = useDispatch();

	const onSetDatePicker = (date) => {
		setDate(date);
	};
	const getDataStudent = useCallback(async () => {
		setIsLoading(true);
		const { data } = await StudentAPI.getStudentById(studentId);
		if (data) {
			setStudent(data);
			setNoteDetail(data.note);
			dispatch(getBusiness({ majors: data.majors._id }));
			dispatch(
				getListTime({
					semester_id: data.smester_id._id,
					campus_id: data.campus_id._id,
				})
			);
		}
		setIsLoading(false);
	}, [studentId]);

	useEffect(() => {
		dispatch(fetchManager());
	}, [dispatch]);

	useEffect(() => {
		getDataStudent();
	}, [dispatch, getDataStudent, studentId]);

	const renderTime = (time) => {
		return moment(new Date(time), 'MM-DD-YYYY HH:mm', true).format('DD-MM-YYYY HH:mm');
	};

	const onSetIsUpdateStudentTime = (time) => {
		setTimeStudent(time);
	};

	const onEditField = (field) => {
		setFieldStudent(field);
	};

	const renderStatus = (status) => {
		if (status === 0) {
			return (
				<span className="status-fail" style={{ color: 'orange' }}>
					Chờ kiểm tra
				</span>
			);
		} else if (status === 1) {
			return (
				<span className="status-up" style={{ color: 'grey' }}>
					Sửa lại CV
				</span>
			);
		} else if (status === 2) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					{student.support === 0 ? ' Chờ nộp biên bản' : ' Nhận CV'}
				</span>
			);
		} else if (status === 3) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					Trượt
				</span>
			);
		} else if (status === 4) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					{student?.form ? 'Đã nộp biên bản' : 'Chờ nộp biên bản'}
					<br />
				</span>
			);
		} else if (status === 5) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					Sửa biên bản
					<br />
				</span>
			);
		} else if (status === 6) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					Đang thực tập <br />
				</span>
			);
		} else if (status === 7) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					{student?.report ? ' Đã nộp báo cáo' : 'Chờ nộp báo cáo'}
					<br />
				</span>
			);
		} else if (status === 8) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					Sửa báo cáo <br />
				</span>
			);
		} else if (status === 9) {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					Hoàn thành <br />
				</span>
			);
		} else {
			return (
				<span className="status-fail" style={{ color: 'red' }}>
					Chưa đăng ký
				</span>
			);
		}
	};

	const onSaveTimeStudent = async () => {
		if (date && date.length > 0) {
			const startTime = date[0]._d.getTime();
			const endTime = date[1]._d.getTime();
			const timeObject = {
				typeNumber: Number(timeStudent.typeNumber),
				startTime: startTime,
				endTime: endTime,
				typeName: timeStudent.typeName,
			};
			if (student.listTimeForm && student.listTimeForm.length > 0) {
				const timeCheck = student.listTimeForm.find(
					(item) => item.typeNumber === timeStudent.typeNumber
				);
				if (timeCheck) {
					timeCheck.startTime = startTime;
					timeCheck.endTime = endTime;
				}
				{
					student.listTimeForm.push(timeObject);
				}
			} else {
				student.listTimeForm.push(timeObject);
			}
			setTimeStudent(null);
			setIsLoading(true);
			const { data } = await StudentAPI.updateStudent(student);
			if (data) {
				setStudent(data);
				message.success('Thay đổi thời gian form thành công');
				setIsLoading(false);
				sendMessageDevice(student, 'thay đổi thời gian form thành công');
			}
		}
	};

	// chỉnh sửa thông tin từng trường sinh viên
	const onFinish = (values) => {
		let messageCheck = '';
		values._id = studentId;
		if (values.internshipTime) {
			values.internshipTime = values.internshipTime._d;
			messageCheck = 'cập nhật thời gian bắt đầu thực tập thành công';
		} else if (values.endInternShipTime) {
			values.endInternShipTime = values.endInternShipTime._d;
			messageCheck = 'cập nhật thời gian kết thúc thực tập thành công';
		} else if (values.attitudePoint) {
			messageCheck = 'cập nhật điểm thái độ thành công';
		} else if (values.resultScore) {
			messageCheck = 'cập nhật điểm kết quả thành công';
		}
		StudentAPI.updateStudent(values).then((res) => {
			if (res.status === 200) {
				message.success('Thành công');
				sendMessageDevice(student, messageCheck);
				setStudent(res.data);
				onCloseFormField();
			} else {
				message.success('Thất bại');
				onCloseFormField();
			}
		});
	};

	const onCloseFormField = () => {
		setFieldStudent('');
	};

	const handelChangeText = (e) => {
		if (e.target.value !== '') {
			setNote(e.target.value);
			setSubmitStatus(true);
		} else {
			setSubmitStatus(false);
		}
	};

	const onSelectStatus = (value) => {
		if (value !== +student.statusCheck) {
			if (optionCheck.includes(value)) {
				setIsShowNote(true);
				setStatusUpdate(value);
			} else {
				setSubmitStatus(true);
				setStatusUpdate(value);
			}
		} else {
			setSubmitStatus(false);
			setIsShowNote(false);
		}
	};
	const onSetStatus = () => {
		setIsShowSelectStatus(!isShowSelectStatus);
	};

	const onShowEditReviewer = () => {
		setIsEditReviewer(!isEditReviewer);
	};

	const onShowEditBusiness = () => {
		setIsEditBusiness(!isEditBusiness);
	};

	const onSetReviewer = async (value) => {
		const { data } = await StudentAPI.updateReviewerSudent({
			listIdStudent: [student._id],
			email: value,
		});
		if (data) {
			getDataStudent();
			setIsEditReviewer(false);
			message.success('Thành công');
			sendMessageDevice(student, 'người review các form của sinh viên đã được thay đổi');
		}
	};

	const onChangeTextArea = (e) => {
		if (e.target.value !== '') {
			setIsSetNote(true);
			setNoteDetail(e.target.value);
		}
	};

	const onUpdateStatus = async () => {
		if (window.confirm('Bạn có chắc chắn muốn đổi trạng thái không?')) {
			const { data } = await StudentAPI.updateStatusSudent({
				listIdStudent: [student._id],
				listEmailStudent: [{ email: student.email }],
				email: infoUser?.manager?.email,
				status: statusUpdate,
				textNote: note,
			});

			if (data.listStudentChangeStatus.length > 0) {
				getDataStudent();
				setStatusUpdate(false);
				setSubmitStatus(false);
				setIsShowSelectStatus(false);
				setIsShowNote(false);
				message.success('Thành công');
				const messageCheck = 'cập nhật trạng thái thành công';
				sendMessageDevice(student, messageCheck);
			}
		}
	};

	const onUpdateNote = async () => {
		const { data } = await StudentAPI.updateStatusSudent({
			listIdStudent: [student._id],
			listEmailStudent: [{ email: student.email }],
			email: infoUser?.manager?.email,
			status: student.statusCheck,
			textNote: noteDetail,
		});
		if (data.listStudentChangeStatus.length > 0) {
			setIsSetNote(false);
			getDataStudent();
			message.success('Cập nhật ghi chú thành công');
			sendMessageDevice(student, 'cập nhật ghi chú thành công');
		}
	};

	const onSelectBusiness = async (value) => {
		const { data } = await StudentAPI.updateBusinessStudent({
			listIdStudent: [student._id],
			business: value,
		});
		if (data) {
			getDataStudent();
			setIsEditBusiness(false);
			message.success('Thành công');
			sendMessageDevice(student, 'công ty thực tập của sinh viên đã được thay đổi');
		}
	};

	useEffect(() => {
		if (
			student.CV &&
			!student.form &&
			!student.report &&
			student.statusCheck !== 3 &&
			student.support === 1
		) {
			setListOption(statusConfigCV);
		} else if (
			(student.CV || (!student.CV && student.support === 0)) &&
			student.form &&
			!student.report &&
			student.statusCheck !== 3 &&
			student.statusCheck !== 6
		) {
			setListOption(statusConfigForm);
		} else if (student.CV && student.form && student.report && student.statusCheck !== 6) {
			setListOption(statusConfigReport);
		} else {
			setListOption([]);
		}
	}, [student.CV, student.form, student.report, student.statusCheck, student.support]);

	const checkFormTime = (time) => {
		if (student.listTimeForm && student.listTimeForm.length > 0) {
			const check = student.listTimeForm.find((item) => item.typeNumber === time.typeNumber);
			if (check) {
				return check;
			}
		}
		return time;
	};

	const checkReviewer = () => {
		if (
			student &&
			student?.reviewer &&
			student.statusCheck !== 9 &&
			student.statusCheck !== 3
		) {
			return student?.reviewer === infoUser?.manager?.email;
		} else {
			return false;
		}
	};

	return (
		<Modal
			className="showModal"
			width="90%"
			title="Chi tiết sinh viên"
			onCancel={closeModal}
			visible={true}
		>
			{isLoading ? (
				<div className="d-flex m-5 p-5 justify-content-center">
					<Spin />
				</div>
			) : (
				<div>
					<h4 className="text-center">Thông tin sinh viên</h4>
					<Row className="col-md-16 mt-3">
						<Col
							xs={{ span: 24 }}
							sm={{ span: 24 }}
							md={{ span: 14 }}
							span={14}
							className="border-right"
							style={{ paddingRight: 20 }}
						>
							<Row className="d-flex align-items-center">
								<Col
									xs={{ span: 24 }}
									sm={{ span: 24 }}
									md={{ span: 12 }}
									className="d-flex"
								>
									<h6>Họ tên: </h6>
									<span className="ms-2">
										{student.name ? student.name : 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Tên công ty: </h6>
									{student.support === 1 ? (
										<span className="ms-2">
											{student.business?.name
												? student.business?.name
												: 'Không có'}
										</span>
									) : (
										<span className="ms-2">
											{student.nameCompany ? student.nameCompany : 'Không có'}
										</span>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Mã sinh viên: </h6>
									<span className="ms-2">
										{student.mssv ? student.mssv : 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Địa chỉ công ty: </h6>
									{student.support === 1 ? (
										<span className="ms-2">
											{student.business?.address
												? student.business?.address
												: 'Không có'}
										</span>
									) : (
										<span className="ms-2">
											{student.addressCompany
												? student.addressCompany
												: 'Không có'}
										</span>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Email: </h6>
									<span className="ms-2">
										{student.email ? student.email : 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Mã số thuế: </h6>
									{student.support === 1 ? (
										<span className="ms-2">
											{student.business?.taxCode
												? student.business?.taxCode
												: 'Không có'}
										</span>
									) : (
										<span className="ms-2">
											{student.taxCode ? student.taxCode : 'Không có'}
										</span>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Chuyên ngành: </h6>
									<span className="ms-2">
										{student.majors ? student.majors.name : 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Vị trí thực tập: </h6>
									{student.support === 1 ? (
										<span className="ms-2">
											{student.business?.internshipPosition
												? student.business?.internshipPosition
												: 'Không có'}
										</span>
									) : (
										<span className="ms-2">
											{student.position ? student.position : 'Không có'}
										</span>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Khoá học: </h6>
									<span className="ms-2">
										{student.course ? student.course : 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>SĐT công ty: </h6>
									<span className="ms-2">
										{student.phoneNumberCompany
											? student.phoneNumberCompany
											: 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Kỳ thực tập: </h6>
									<span className="ms-2">
										{student?.smester_id?.name
											? student.smester_id?.name
											: 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Email người xác nhận: </h6>
									<span className="ms-2">
										{student.emailEnterprise
											? student.emailEnterprise
											: 'Không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Số điện thoại: </h6>
									<span className="ms-2">
										{student?.phoneNumber ? student?.phoneNumber : 'không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }}>
									<div className="d-flex align-items-center justify-content-between">
										<div className="d-flex">
											<h6>Ngày bắt đầu thực tập: </h6>
											<span className="ms-2">
												{student.internshipTime
													? renderTime(student.internshipTime)
													: 'Không có'}
											</span>
										</div>
										{student.internshipTime && checkReviewer() && (
											<EditOutlined
												onClick={() => onEditField('internshipTime')}
											/>
										)}
									</div>
									{fieldStudent === 'internshipTime' &&
										student.internshipTime && (
											<Form
												name="basic"
												// labelCol={{ span: 8 }}
												// wrapperCol={{ span: 16 }}
												initialValues={{ remember: true }}
												onFinish={onFinish}
												autoComplete="off"
											>
												<Form.Item
													label="Chọn thời gian"
													name="internshipTime"
													rules={[
														{
															required: true,
															message: 'Bạn phải chọn thời gian',
														},
													]}
												>
													<DatePicker
														defaultValue={moment(
															student.internshipTime,
															dateFormatInput
														)}
														format={dateFormatInput}
													/>
												</Form.Item>

												<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
													<Button
														onClick={onCloseFormField}
														type="danger"
														htmlType="button"
														className="me-4"
													>
														Huỷ
													</Button>
													<Button type="primary" htmlType="submit">
														Lưu
													</Button>
												</Form.Item>
											</Form>
										)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Địa chỉ: </h6>
									<span className="ms-2">
										{student?.address ? student?.address : 'không có'}
									</span>
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }}>
									<div className="d-flex align-items-center justify-content-between">
										<div className="d-flex">
											<h6>Ngày kết thúc thực tập: </h6>
											<span className="ms-2">
												{student.endInternShipTime
													? renderTime(student.endInternShipTime)
													: 'Không có'}
											</span>
										</div>
										{student.endInternShipTime && checkReviewer() && (
											<EditOutlined
												onClick={() => onEditField('endInternShipTime')}
											/>
										)}
									</div>
									{fieldStudent === 'endInternShipTime' &&
										student.internshipTime && (
											<Form
												name="basic"
												// labelCol={{ span: 8 }}
												// wrapperCol={{ span: 16 }}
												initialValues={{ remember: true }}
												onFinish={onFinish}
												autoComplete="off"
											>
												<Form.Item
													label="Chọn thời gian"
													name="endInternShipTime"
													rules={[
														{
															required: true,
															message: 'Bạn phải chọn thời gian',
														},
													]}
												>
													<DatePicker
														defaultValue={moment(
															student.endInternShipTime,
															dateFormatInput
														)}
													/>
												</Form.Item>

												<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
													<Button
														onClick={onCloseFormField}
														type="danger"
														htmlType="button"
														className="me-4"
													>
														Huỷ
													</Button>
													<Button type="primary" htmlType="submit">
														Lưu
													</Button>
												</Form.Item>
											</Form>
										)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Phân loại: </h6>
									{student.support !== null ? (
										<span className="ms-2">
											{student.support === 1 && 'Nhờ nhà trường hỗ trợ'}
											{student.support === 0 && 'Tự tìm nơi thực tập'}
										</span>
									) : (
										<span className="ms-2">Chưa nhập form</span>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }}>
									<div className="d-flex align-items-center justify-content-between">
										<div className="d-flex">
											<h6>Điểm thái độ: </h6>
											<span className="ms-2">
												{student.attitudePoint
													? student.attitudePoint
													: 'Không có'}
											</span>
										</div>
										{student.attitudePoint && checkReviewer() && (
											<EditOutlined
												onClick={() => onEditField('attitudePoint')}
											/>
										)}
									</div>
									{fieldStudent === 'attitudePoint' && student.attitudePoint && (
										<Form
											name="basic"
											// labelCol={{ span: 8 }}
											// wrapperCol={{ span: 16 }}
											initialValues={{ remember: true }}
											onFinish={onFinish}
											autoComplete="off"
										>
											<Form.Item
												label="Nhập điểm thái độ"
												name="attitudePoint"
											>
												<InputNumber
													defaultValue={student.attitudePoint}
													type="number"
													max={10}
													min={0}
												/>
											</Form.Item>

											<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
												<Button
													onClick={onCloseFormField}
													type="danger"
													htmlType="button"
													className="me-4"
												>
													Huỷ
												</Button>
												<Button type="primary" htmlType="submit">
													Lưu
												</Button>
											</Form.Item>
										</Form>
									)}
								</Col>

								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6 className="me-2">Trạng thái: </h6>
									{renderStatus(student.statusCheck)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }}>
									<div className="d-flex align-items-center justify-content-between">
										<div className="d-flex">
											<h6>Điểm kết thúc: </h6>
											<span className="ms-2">
												{student.resultScore
													? student.resultScore
													: 'Không có'}
											</span>
										</div>
										{student.resultScore && checkReviewer() && (
											<EditOutlined
												onClick={() => onEditField('resultScore')}
											/>
										)}
									</div>
									{fieldStudent === 'resultScore' && student.resultScore && (
										<Form
											name="basic"
											// labelCol={{ span: 8 }}
											// wrapperCol={{ span: 16 }}
											initialValues={{ remember: true }}
											onFinish={onFinish}
											autoComplete="off"
										>
											<Form.Item
												label="Nhập điểm kết thúc"
												name="resultScore"
											>
												<InputNumber
													defaultValue={student.resultScore}
													type="number"
													max={10}
													min={0}
												/>
											</Form.Item>

											<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
												<Button
													onClick={onCloseFormField}
													type="danger"
													htmlType="button"
													className="me-4"
												>
													Huỷ
												</Button>
												<Button type="primary" htmlType="submit">
													Lưu
												</Button>
											</Form.Item>
										</Form>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>CV: </h6>
									{student.CV ? (
										// eslint-disable-next-line jsx-a11y/anchor-is-valid
										<a
											className="ms-2 text-one-row"
											onClick={() => window.open(student.CV)}
										>
											{student.CV}
										</a>
									) : (
										<span className="ms-2">Chưa nộp</span>
									)}
								</Col>
								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Biên bản: </h6>
									{student.form ? (
										<a
											className="ms-2 text-one-row"
											onClick={() => window.open(student.form)}
										>
											{student.form}
										</a>
									) : (
										<span className="ms-2">Chưa nộp</span>
									)}
								</Col>

								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>SV đã được hỗ trợ TT: </h6>
									{student.support ? (
										// eslint-disable-next-line jsx-a11y/anchor-is-valid
										<p className="ms-2 text-one-row">{student.support}</p>
									) : (
										<span className="ms-2">Chưa được hỗ trợ</span>
									)}
								</Col>

								<Col xs={{ span: 24 }} md={{ span: 12 }} className="d-flex">
									<h6>Báo cáo: </h6>
									{student.report ? (
										<a
											className="ms-2 text-one-row"
											onClick={() => window.open(student.report)}
										>
											{student.report}
										</a>
									) : (
										<span className="ms-2">Chưa nộp</span>
									)}
								</Col>
							</Row>
						</Col>
						<Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 10 }} span={10}>
							<div className="detal-form-status">
								<div
									className="d-flex justify-content-between align-items-center mb-3"
									style={{ flexWrap: 'wrap' }}
								>
									<h6 className="mb-0 me-2 text-header-abc">Trạng thái: </h6>
									{isShowSelectStatus ? (
										<Select
											onChange={onSelectStatus}
											defaultValue="Trạng thái"
											style={{ width: '50%' }}
										>
											{listOption &&
												listOption.length > 0 &&
												checkReviewer() &&
												listOption.map((item, index) => (
													<Option value={item.value} key={index}>
														{item.title}
													</Option>
												))}
										</Select>
									) : (
										renderStatus(student.statusCheck)
									)}

									{isShowNote && (
										<Input
											style={{
												width: '100%',
												marginTop: 10,
												marginBottom: 10,
											}}
											onChange={handelChangeText}
											placeholder="Nhập text note"
										/>
									)}
									{listOption &&
									listOption.length > 0 &&
									student.statusCheck !== 5 &&
									student.statusCheck !== 8 &&
									student.statusCheck !== 9 &&
									student.statusCheck !== 1 &&
									checkReviewer() ? (
										submitStatus ? (
											<Button type="primary" onClick={onUpdateStatus}>
												Thực hiện
											</Button>
										) : (
											!isShowNote && <EditOutlined onClick={onSetStatus} />
										)
									) : (
										<span></span>
									)}
								</div>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h6 className="mb-0 me-2 text-header-abc">Người review: </h6>
									{isEditReviewer ? (
										<Select
											onChange={onSetReviewer}
											defaultValue="Chọn người review"
											style={{ width: '50%' }}
										>
											{listManager &&
												listManager?.length > 0 &&
												listManager.map((item, index) => (
													<Option key={index} value={item.email}>
														{item.name} - {item.email}
													</Option>
												))}
										</Select>
									) : student.reviewer ? (
										student.reviewer
									) : (
										'Chưa có'
									)}

									{listOption &&
									student.statusCheck !== 9 &&
									student.statusCheck !== 3 &&
									listOption.length > 0 ? (
										<EditOutlined onClick={onShowEditReviewer} />
									) : (
										<span></span>
									)}
								</div>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h6 className="mb-0 me-2 text-header-abc">Công ty: </h6>
									{isEditBusiness &&
									student.support === 1 &&
									checkReviewer() &&
									student.CV ? (
										<Select
											onChange={onSelectBusiness}
											// defaultValue="Chọn công ty"
											style={{ width: '60%' }}
											defaultValue={student?.business?._id}
										>
											{listBusiness &&
												student.CV &&
												listBusiness.list &&
												listBusiness.list.length > 0 &&
												listBusiness.list.map((item, index) => (
													<Option key={index} value={item._id}>
														{item.code_request}-{item.name} -{' '}
														{item.internshipPosition} -{' '}
														{item.majors.name}
													</Option>
												))}
										</Select>
									) : (
										<span>
											{student.support === 1 ? (
												<span className="ms-2">
													{student.business?.name
														? student.business?.name
														: 'Không có'}
												</span>
											) : (
												<span className="ms-2">
													{student.nameCompany
														? student.nameCompany
														: 'Không có'}
												</span>
											)}
										</span>
									)}

									{listBusiness &&
									listBusiness.list &&
									student.CV &&
									listBusiness.list.length > 0 &&
									checkReviewer() &&
									student.support === 1 ? (
										<EditOutlined onClick={onShowEditBusiness} />
									) : (
										<span></span>
									)}
								</div>
								<div className=" mb-3">
									<h6 className="m-0">Thời gian hiển thị form nhập </h6>
								</div>
								<div>
									<ul className="m-0 p-0 ms-3">
										{times &&
											times.length > 0 &&
											times.map((time) => {
												if (time.typeNumber !== 4) {
													const studentFormTime = checkFormTime(time);
													return (
														<li
															key={time._id}
															className="form-time-text align-items-center"
														>
															<span className="text-upcatch">
																{time.typeName}
															</span>{' '}
															:{' '}
															{timeStudent &&
															timeStudent?.typeNumber ===
																studentFormTime.typeNumber ? (
																<div>
																	<RangePicker
																		onChange={onSetDatePicker}
																		showTime
																		format={dateFormat}
																		defaultValue={[
																			moment(
																				new Date(
																					studentFormTime.startTime
																				),
																				dateFormat
																			),
																			moment(
																				new Date(
																					studentFormTime.endTime
																				),
																				dateFormat
																			),
																		]}
																		disabledDate={(current) => {
																			let startDate =
																				new Date(
																					student.smester_id.start_time
																				).getTime();
																			let endDate = new Date(
																				student.smester_id.end_time
																			).getTime();
																			return (
																				(current &&
																					new Date(
																						current
																					).getTime() <
																						startDate) ||
																				(current &&
																					new Date(
																						current
																					).getTime() >
																						endDate)
																			);
																		}}
																	/>
																	<div className="my-2">
																		<Button
																			onClick={() =>
																				setTimeStudent({})
																			}
																			type="default"
																		>
																			Huỷ
																		</Button>
																		<Button
																			className="ms-3"
																			onClick={
																				onSaveTimeStudent
																			}
																			type="primary"
																		>
																			Đặt thời gian
																		</Button>
																	</div>
																</div>
															) : (
																<span>
																	<span className="mx-1">Từ</span>{' '}
																	{renderTime(
																		studentFormTime.startTime
																	)}
																	<span className="mx-1">
																		đến
																	</span>
																	{renderTime(
																		studentFormTime.endTime
																	)}
																	{checkReviewer() && (
																		<span className="ms-2">
																			<EditOutlined
																				color="blue"
																				onClick={() =>
																					onSetIsUpdateStudentTime(
																						studentFormTime
																					)
																				}
																			/>
																		</span>
																	)}
																</span>
															)}
														</li>
													);
												}
											})}
									</ul>
								</div>
							</div>
						</Col>
					</Row>
					<Col style={{ marginTop: 40 }} span={24}>
						<h6>Ghi chú cho sinh viên</h6>
					</Col>
					<Col span={24}>
						<TextArea
							value={noteDetail}
							showCount
							maxLength={100}
							style={{ height: 80, marginBottom: 10 }}
							onChange={onChangeTextArea}
						/>
						{isSetNote && (
							<Button type="primary" onClick={onUpdateNote}>
								Cập nhật ghi chú
							</Button>
						)}
					</Col>
				</div>
			)}
		</Modal>
	);
};

export default StudentDetail;
