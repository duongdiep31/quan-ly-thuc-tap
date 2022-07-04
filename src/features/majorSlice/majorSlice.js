import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import majorAPI from '../../API/majorAPi';

export const getListMajor = createAsyncThunk('major/getListMajor', async () => {
  const { data } = await majorAPI.getList();
  return data?.majors;
});
export const getMajor = createAsyncThunk('major/getMajor', async (id) => {
  const { data } = await majorAPI.get(id);
  return data?.major;
});
export const createMajor = createAsyncThunk('major/createMajor', async (z) => {
  const { data } = await majorAPI.create(z.data);
  z.callback(data.status, data.msg);
  return data;
});
export const updateMajor = createAsyncThunk('major/updateMajor', async (z) => {
  const {data} = await majorAPI.update(z.data._id, z.data);
  console.log(data);
  z.callback(data.status, data.message);
  return data.data;
});

export const removeMajor = createAsyncThunk('major,removeMajor', async (id) => {
  const { data } = await majorAPI.remove(id);
  return data;
});
const majorSlice = createSlice({
  name: 'major',
  initialState: {
    listMajor: [],
    loading: false,
    major: {},
    message: '',
    success: false,
  },
  extraReducers: (builder) => {
    //getListMajor
    builder.addCase(getListMajor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getListMajor.fulfilled, (state, action) => {
      state.listMajor = action.payload;
      state.loading = false;
    });
    builder.addCase(getListMajor.rejected, (state) => {
      state.loading = false;
    });

    //getMajor
    builder.addCase(getMajor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getMajor.fulfilled, (state, action) => {
      state.major = action.payload;
      state.loading = false;
    });
    builder.addCase(getMajor.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(createMajor.pending, (state, { payload }) => {
      state.loading = true;
    });
    builder.addCase(createMajor.fulfilled, (state, { payload }) => {
      if(payload.status === 'ok'){
      state.listMajor = [payload.data, ...state.listMajor];
      }
      state.loading = false;
    });
    builder.addCase(createMajor.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });

    //updateMajor
    builder.addCase(updateMajor.pending, (state) => {
      console.log(123);
      state.loading = true;
    });
    builder.addCase(updateMajor.fulfilled, (state, { payload }) => {
      console.log(payload);
      let data = state.listMajor.filter((item) => item._id !== payload._id);
      state.listMajor = [ payload ,...data, ];
      state.loading = false;
    });
    builder.addCase(updateMajor.rejected, (state, payload) => {
      state.loading = false;
      state.success = false;
    });

    //removeMajor
    builder.addCase(removeMajor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeMajor.fulfilled, (state, { payload }) => {
      console.log(payload);
      state.listMajor = state.listMajor.filter((item) => item._id !== payload.major._id);
      state.message = payload.message;
      state.loading = false;
    });
    builder.addCase(removeMajor.rejected, (state) => {
      state.loading = false;
      state.success = false;
    });
  },
});

export default majorSlice.reducer;
