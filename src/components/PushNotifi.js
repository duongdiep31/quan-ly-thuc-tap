import axios from "axios";

export const sendMessageDevice = async (infoUser, message) => {
    try {
        const { data } = await axios.get(
            `http://3.0.249.70:8000/api/tokens/${infoUser?._id}`
          );
          
          if (data && data?.tokenDevice && data?.tokenDevice?.tokens) {
            // title, note, registration_ids, imageUrl
            const registration_ids = data?.tokenDevice?.tokens?.map(
              (item) => item.token
            );
            const body = {
              registration_ids,
              title: `Thông báo ${message}`,
              note: `Thông báo sinh viên ${infoUser?.name} - ${message}. Sinh viên kiểm tra mail thường xuyên để nắm rõ được trạng thái của mình. Phòng QHDN xin cảm ơn !!!`,
              imageUrl: "ic_launcher.png",
            };
        
            const { data: notifi } = await axios.post(
              "http://3.0.249.70:8000/api/send-message",
              body
            );
            if (notifi) {
              const bodyForm = {
                student_id: infoUser?._id,
                note: `[Phòng QHDN] - Thông báo sinh viên ${infoUser?.name} - ${message}. Sinh viên kiểm tra mail thường xuyên để nắm rõ được trạng thái của mình. Phòng QHDN xin cảm ơn !!!`,
                title: `[Phòng QHDN] - Thông báo ${message}`,
              };
              const { data: noti } = await axios.post(
                "http://3.0.249.70:8000/api/notification",
                bodyForm
              );
            }
          }
    } catch (error) {
        console.log(error);
    }
};
