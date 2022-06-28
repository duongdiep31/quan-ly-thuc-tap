import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select, Table } from "antd";
import Column from "antd/lib/table/Column";
import * as FileSaver from "file-saver";
import { get, omit } from "lodash";
import { array, object } from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import SemestersAPI from "../../API/SemestersAPI";
import style from "../../common/styles/status.module.css";
import UpFile from "../../components/ExcelDocument/UpFile";
import StudentDetail from "../../components/studentDetail/StudentDetail";
import { getListMajor } from "../../features/majorSlice/majorSlice";
import { fetchManager } from "../../features/managerSlice/managerSlice";
import { updateReviewerListStudent } from "../../features/reviewerStudent/reviewerSlice";
import { getSemesters } from "../../features/semesters/semestersSlice";
import {
  getStudent,
  getAllStudent,
} from "../../features/StudentSlice/StudentSlice";
import { filterStatuss } from "../../ultis/selectOption";
import { getLocal } from "../../ultis/storage";
const { Option } = Select;
const keyMajors = "majors";
const Status = ({
  listStudent: { list, total },
  listAllStudent,
  loading,
  listSemesters,
  defaultSemester,
  listManager,
  listBusiness,
  listMajors,
  isMobile,
}) => {
  const infoUser = getLocal();
  const [studentdetail, setStudentDetail] = useState("");
  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const [chooseIdStudent, setChooseIdStudent] = useState([]);
  const [listIdStudent, setListIdStudent] = useState([]);
  const [page, setPage] = useState({
    page: 1,
    limit: 20,
    campus_id:
      infoUser && infoUser.manager && infoUser.manager.campus_id
        ? infoUser.manager.campus_id
        : "",
    smester_id:
      defaultSemester && defaultSemester._id ? defaultSemester._id : "",
  });
  const [major, setMajor] = useState("");
  const [filter, setFiler] = useState();
  const onShowDetail = (mssv, key) => {
    setStudentDetail(key);
    setModal(true);
  };

  const onCloseModal = () => {
    setModal(false);
    getListStudent();
  };

  const getListStudent = async () => {
    if (page?.smester_id && page?.smester_id.length > 0) {
      dispatch(
        getStudent({
          ...page,
          ...filter,
        })
      );
    } else {
      SemestersAPI.getDefaultSemester()
        .then((res) => {
          if (res.status === 200) {
            dispatch(
              getStudent({
                ...page,
                ...filter,
                smester_id: res.data._id,
              })
            );
          }
        })
        .catch(() => {});
    }
  };

  const getStudentExportExcel = async () => {
    if (page?.smester_id && page?.smester_id.length > 0) {
      dispatch(
        getAllStudent({
          ...filter,
        })
      );
    } else {
      SemestersAPI.getDefaultSemester()
        .then((res) => {
          if (res.status === 200) {
            dispatch(
              getAllStudent({
                smester_id: res.data._id,
              })
            );
          }
        })
        .catch(() => {});
    }
  };
  const getListAllStudent = listAllStudent.list;

  useEffect(() => {
    getListStudent();
    getStudentExportExcel();
  }, [page, dispatch]);
  useEffect(() => {
    dispatch(getSemesters());
    dispatch(getListMajor());
    dispatch(fetchManager());
  }, [dispatch]);
  const columns = [
    {
      title: "MSSV",
      dataIndex: "mssv",
      width: 100,
      fixed: "left",
      render: (val, key) => {
        return (
          <p
            style={{ margin: 0, cursor: "pointer", color: "blue" }}
            onClick={() => onShowDetail(val, key)}
          >
            {val}
          </p>
        );
      },
    },
    {
      title: "Họ và Tên",
      dataIndex: "name",
      width: 150,
      fixed: "left",
      render: (val, key) => {
        return <p style={{ textAlign: "left" }}>{val}</p>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 200,
    },
    {
      title: "Điện thoại",
      dataIndex: "phoneNumber",
      width: 160,
    },
    {
      title: "Ngành",
      dataIndex: "majors",
      width: 100,
      render: (val) => val.name,
    },
    {
      title: "Phân loại",
      dataIndex: "support",
      width: 90,
      render: (val) => {
        if (val === 1) {
          return "Hỗ trợ";
        } else if (val === 0) {
          return "Tự tìm";
        } else {
          return "";
        }
      },
    },
    {
      title: "CV",
      dataIndex: "CV",
      width: 50,
      render: (val) =>
        val ? (
          <EyeOutlined className="icon-cv" onClick={() => window.open(val)} />
        ) : (
          ""
        ),
    },
    {
      title: "Người review",
      dataIndex: "reviewer",
      width: 230,
    },
    {
      title: "Trạng thái",
      dataIndex: "statusCheck",
      render: (status) => {
        if (status === 0) {
          return (
            <span className="status-fail" style={{ color: "orange" }}>
              Chờ kiểm tra
            </span>
          );
        } else if (status === 1) {
          return (
            <span className="status-up" style={{ color: "grey" }}>
              Sửa lại CV
            </span>
          );
        } else if (status === 2) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Nhận CV
            </span>
          );
        } else if (status === 3) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Trượt
            </span>
          );
        } else if (status === 4) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Đã nộp biên bản <br />
            </span>
          );
        } else if (status === 5) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Sửa biên bản
              <br />
            </span>
          );
        } else if (status === 6) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Đang thực tập <br />
            </span>
          );
        } else if (status === 7) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Đã nộp báo cáo <br />
            </span>
          );
        } else if (status === 8) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Sửa báo cáo <br />
            </span>
          );
        } else if (status === 9) {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Hoàn thành <br />
            </span>
          );
        } else {
          return (
            <span className="status-fail" style={{ color: "red" }}>
              Chưa đăng ký
            </span>
          );
        }
      },
    },
  ];
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setListIdStudent(selectedRowKeys);
      setChooseIdStudent(selectedRows);
    },
  };
  const handleStandardTableChange = (key, value) => {
    if (key === keyMajors) {
      setMajor(value);
    }
    const newValue =
      value.length > 0 || (value < 11 && value !== "")
        ? {
            ...filter,
            [key]: value,
          }
        : omit(filter, [key]);
    setFiler(newValue);
  };
  const handleSearch = () => {
    getListStudent();
  };

  const comfirm = () => {
    dispatch(
      updateReviewerListStudent({
        listIdStudent: listIdStudent,
        email: infoUser?.manager?.email,
      })
    );
    alert("Thêm thành công ");
    navigate("/review-cv");
  };

  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  console.log(list);
  const exportToCSV = (list) => {
    const newData = [];
    list.filter((item) => {
      const newObject = {};
      newObject["Kỳ học"] = item["smester_id"].name;
      newObject["Cơ sở"] = item["campus_id"].name;
      newObject["MSSV"] = item["mssv"];
      newObject["Họ tên"] = item["name"];
      newObject["Email"] = item["email"];
      newObject["Ngành"] = item["majors"].name;
      newObject["Mã ngành"] = item["majors"].majorCode;
      newObject["CV"] = item["CV"];
      newObject["Biên bản"] = item["form"];
      newObject["Báo cáo"] = item["report"];
      newObject["Người review"] = item["reviewer"];
      newObject["Số điện thoại"] = item["phoneNumber"];
      newObject["Tên công ty"] = item["nameCompany"];
      newObject["Địa chỉ công ty"] = item["addressCompany"];
      newObject["Mã số thuế"] = item["taxCode"];
      newObject["Vị trí thực tập"] = item["position"];
      newObject["Điểm thái độ"] = item["attitudePoint"];
      newObject["Điểm kết quả"] = item["resultScore"];
      newObject["Thời gian thực tập"] = item["internshipTime"];
      newObject["Hình thức"] = item["support"];
      newObject["Ghi chú"] = item["note"];
      return newData.push(newObject);
    });
    // eslint-disable-next-line array-callback-return
    newData.filter((item) => {
      if (item["Hình thức"] === 1) {
        item["Hình thức"] = 1;
        item["Hình thức"] = "Hỗ trợ";
      } else if (item["Hình thức"] === 0) {
        item["Hình thức"] = 0;
        item["Hình thức"] = "Tự tìm";
      } else {
      }
    });
    const ws = XLSX.utils.json_to_sheet(newData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileExtension);
  };
  const parentMethods = {
    major,
    ...page,
  };
  return (
    <div className={style.status}>
      <div className={style.flex_header}>
        <h4 className={style.flex_header.h4}>Sinh viên đăng ký thực tập</h4>
        {!isMobile && (
          <>
            <Col xs={{ span: 12 }} md={{ span: 8 }}>
              <div className={style.div}>
                <span className={style.span}>Học Kỳ : </span>
                <Select
                  className={style.select}
                  onChange={(val) => setPage({ ...page, smester_id: val })}
                  placeholder="Chọn kỳ"
                >
                  {listSemesters &&
                    listSemesters.length > 0 &&
                    listSemesters?.map((item, index) => (
                      <Option value={item._id} key={index}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </div>
            </Col>
            <div className={style.div} style={{ paddingRight: "30px" }}>
              <span style={{ padding: "10px" }}>Ngành:</span>
              <Select
                className="filter-status"
                onChange={(val) => setMajor(val)}
                placeholder="Chọn ngành"
              >
                {listMajors &&
                  listMajors?.map((item, index) => (
                    <Option value={item._id} key={index}>
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </div>

            <div
              style={isMobile ? { display: "none" } : { display: "flex" }}
              className={style.btn_export}
            >
              <Button
                variant="warning"
                className={style.button}
                onClick={(e) => exportToCSV(getListAllStudent)}
              >
                Export
              </Button>
            </div>

            <div
              style={{ display: "flex", paddingLeft: "10px" }}
              className={style.btn_export}
            >
              <UpFile
                parentMethods={{
                  ...parentMethods,
                  major: parentMethods.major
                    ? listMajors && listMajors.length > 0
                      ? listMajors[0]._id
                      : ""
                    : "",
                }}
                keys="status"
              />
            </div>
          </>
        )}
      </div>
      <div>
        {isMobile ? (
          <>
            <Row
              style={{
                marginTop: 20,
              }}
            >
              <Col span={12}>
                <Select
                  style={{ width: "95%", position: "relative" }}
                  className="select-branch"
                  onChange={(val) => setPage({ ...page, smester_id: val })}
                  placeholder="Chọn kỳ"
                >
                  {listSemesters &&
                    listSemesters.length > 0 &&
                    listSemesters?.map((item, index) => (
                      <Option value={item._id} key={index}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Col>

              <Col span={12}>
                <div className={style.div}>
                  <Select
                    className="select-branch"
                    style={{ width: "100%", position: "relative" }}
                    onChange={(val) => handleStandardTableChange("majors", val)}
                    placeholder="Lọc theo ngành"
                  >
                    {listMajors &&
                      listMajors.map((item, index) => (
                        <>
                          <Option value={item._id} key={index}>
                            {item.name}
                          </Option>
                        </>
                      ))}
                  </Select>
                </div>
              </Col>
            </Row>

            <Row
              style={{
                marginTop: 20,
              }}
            >
              <Col span={12}>
                <div className={style.div}>
                  <Select
                    className="filter-status"
                    style={{ width: "95%" }}
                    onChange={(val) =>
                      handleStandardTableChange("statusCheck", val)
                    }
                    placeholder="Lọc theo trạng thái"
                  >
                    {filterStatuss.map((item, index) => (
                      <Option value={item.id} key={index}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col span={12}>
                <div className={style.div}>
                  <Input
                    style={{ width: "100%" }}
                    placeholder="Tìm kiếm theo mã sinh viên"
                    onChange={(val) =>
                      handleStandardTableChange("mssv", val.target.value.trim())
                    }
                  />
                </div>
              </Col>
            </Row>
            <Row
              style={{
                marginTop: 20,
              }}
            >
              <Col span={12}>
                <UpFile
                  parentMethods={{
                    ...parentMethods,
                    major: parentMethods.major
                      ? listMajors && listMajors.length > 0
                        ? listMajors[0]._id
                        : ""
                      : "",
                  }}
                  keys="status"
                  style={{ fontSize: ".9rem" }}
                />
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  variant="warning"
                  className={style.button}
                  style={{
                    width: "100%",
                  }}
                  onClick={(e) => exportToCSV(getListAllStudent)}
                >
                  Export
                </Button>
              </Col>
            </Row>
            <Row
              style={{
                marginTop: 20,
              }}
            >
              <Col span={12}>
                <Button
                  style={{
                    width: "95%",
                  }}
                  type="primary"
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
              </Col>

              {chooseIdStudent.length > 0 && (
                <Col span={12}>
                  <Button
                    style={{
                      width: "100%",
                    }}
                    type="primary"
                    onClick={() => comfirm()}
                  >
                    Xác nhận
                  </Button>
                </Col>
              )}
            </Row>
          </>
        ) : (
          <Row>
            <Col
              xs={{ span: 24 }}
              md={{ span: 8 }}
              style={{ paddingBottom: "15px" }}
            >
              <div className={style.div}>
                <span className="select-status" style={{ width: "50%" }}>
                  Ngành :{" "}
                </span>
                <Select
                  className="select-branch"
                  style={{ width: "100%", position: "relative", right: "5%" }}
                  onChange={(val) => handleStandardTableChange("majors", val)}
                  placeholder="Lọc theo ngành"
                >
                  {listMajors &&
                    listMajors.map((item, index) => (
                      <>
                        <Option value={item._id} key={index}>
                          {item.name}
                        </Option>
                      </>
                    ))}
                </Select>
              </div>
            </Col>

            <Col
              xs={{ span: 24 }}
              md={{ span: 8 }}
              style={{ marginBottom: "15px" }}
            >
              <div className={style.div}>
                <span
                  style={{ width: "50%", paddingRight: "10px" }}
                  className={style.span3}
                >
                  Trạng thái:
                </span>
                <Select
                  className="filter-status"
                  style={{ width: "100%", position: "relative", right: "5%" }}
                  onChange={(val) =>
                    handleStandardTableChange("statusCheck", val)
                  }
                  placeholder="Lọc theo trạng thái"
                >
                  {filterStatuss.map((item, index) => (
                    <Option value={item.id} key={index}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={{ span: 24 }} md={{ span: 8 }}>
              <div className={style.div}>
                <span style={{ paddingRight: "15px" }} className={style.span3}>
                  Tìm Kiếm:{" "}
                </span>
                <Input
                  style={{ width: "65%", position: "relative", right: "6%" }}
                  placeholder="Tìm kiếm theo mã sinh viên"
                  onChange={(val) =>
                    handleStandardTableChange("mssv", val.target.value.trim())
                  }
                />
              </div>
            </Col>
            <br />
            <br />
            <Col
              xs={24}
              sm={4}
              md={24}
              lg={24}
              xl={4}
              style={{ padding: "0 10px" }}
            >
              <Button
                style={{
                  color: "#fff",
                  background: "#ee4d2d",
                  display: "flex",
                }}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>

              {chooseIdStudent.length > 0 && (
                <Button
                  style={{
                    marginTop: "10px",
                    color: "#fff",
                    background: "#ee4d2d",
                  }}
                  onClick={() => comfirm()}
                >
                  Xác nhận
                </Button>
              )}
            </Col>
          </Row>
        )}
      </div>

      {window.innerWidth > 1024 ? (
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          pagination={{
            pageSize: page.limit,
            total: total,
            onChange: (page, pageSize) => {
              setPage({
                page: page,
                limit: pageSize,
                campus_id: infoUser.manager.cumpus,
                ...filter,
              });
            },
          }}
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={list}
          scroll={{ x: "calc(700px + 50%)" }}
        />
      ) : (
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          pagination={{
            pageSize: page.limit,
            total: total,
            onChange: (page, pageSize) => {
              setPage({
                page: page,
                limit: pageSize,
                campus_id: infoUser.manager.cumpus,
                ...filter,
              });
            },
          }}
          rowKey="_id"
          loading={loading}
          dataSource={list}
        >
          <Column
            title="Mssv"
            dataIndex="mssv"
            key="_id"
            render={(val, key) => {
              return (
                <p
                  style={{ margin: 0, cursor: "pointer", color: "blue" }}
                  onClick={() => onShowDetail(val, key)}
                >
                  {val}
                </p>
              );
            }}
          />
          <Column title="Họ và Tên" dataIndex="name" key="_id" />
          {window.innerWidth > 739 && window.innerWidth < 1023 && (
            <Column title="Email" dataIndex="email" key="_id" />
          )}
          <Column
            title="Trạng thái"
            dataIndex="statusCheck"
            key="_id"
            render={(status) => {
              if (status === 0) {
                return (
                  <span className="status-fail" style={{ color: "orange" }}>
                    Chờ kiểm tra
                  </span>
                );
              } else if (status === 1) {
                return (
                  <span className="status-up" style={{ color: "grey" }}>
                    Sửa lại CV
                  </span>
                );
              } else if (status === 2) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Nhận CV
                  </span>
                );
              } else if (status === 3) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Trượt
                  </span>
                );
              } else if (status === 4) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Đã nộp biên bản <br />
                  </span>
                );
              } else if (status === 5) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Sửa biên bản <br />
                  </span>
                );
              } else if (status === 6) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Đang thực tập <br />
                  </span>
                );
              } else if (status === 7) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Đã nộp báo cáo <br />
                  </span>
                );
              } else if (status === 8) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Sửa báo cáo <br />
                  </span>
                );
              } else if (status === 9) {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Hoàn thành <br />
                  </span>
                );
              } else {
                return (
                  <span className="status-fail" style={{ color: "red" }}>
                    Chưa đăng ký
                  </span>
                );
              }
            }}
          />
        </Table>
      )}

      {modal && (
        <StudentDetail
          infoUser={infoUser}
          studentId={studentdetail._id}
          onShowModal={modal}
          closeModal={onCloseModal}
          listBusiness={listBusiness}
          listManager={listManager}
        />
      )}
    </div>
  );
};

Status.propTypes = {
  listStudent: object,
  infoUser: object,
  listManager: object,
  listBusiness: object,
  listMajors: array,
};

export default connect(
  ({ students, semester, manager, business, major, global }) => ({
    listStudent: students.listStudent,
    listAllStudent: students.listAllStudent,
    listSemesters: semester.listSemesters,
    defaultSemester: semester.defaultSemester,
    loading: students.loading,
    listManager: manager.listManager,
    listBusiness: business.listBusiness,
    listMajors: major.listMajor,
    ...global,
  })
)(Status);
