import { createApp, ref, onMounted } from "vue";
import ElementPlus from "https://cdn.jsdelivr.net/npm/element-plus@2.8.0/dist/index.full.js";
import { db } from "./cloudbase.js";
import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js";

createApp({
  setup() {
    const password = ref("");
    const isLogin = ref(false);
    const list = ref([]);
    const selectDate = ref("");
    const selectedIds = ref([]);
    const allChecked = ref(false);

    // 管理员密码（你可以自己改）
    const adminPwd = "admin123456";

    // 登录
    const login = () => {
      if (password.value === adminPwd) {
        isLogin.value = true;
        getList();
      } else {
        alert("密码错误");
      }
    };

    // 获取全部预约数据
    const getList = async () => {
      const res = await db.collection("loan_orders").orderBy("createTime", "desc").get();
      list.value = res.data.map((item, index) => ({
        ...item,
        index: index + 1,
        fileName: `${index + 1}-${item.submitTime.split(" ")[0]}-${item.stuName}`
      }));
    };

    // 导出单张图片
    const exportImg = async (item, domId) => {
      const dom = document.getElementById(domId);
      const canvas = await html2canvas(dom, { scale: 2 });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = item.fileName + ".png";
      a.click();
    };

    // 批量下载
    const batchDownload = async () => {
      for (let id of selectedIds.value) {
        await exportImg(list.value.find(i => i._id === id), "card-" + id);
      }
    };

    // 删除单条
    const deleteItem = async (id) => {
      if (!confirm("确定删除？")) return;
      await db.collection("loan_orders").doc(id).remove();
      getList();
    };

    return {
      password,
      isLogin,
      login,
      list,
      selectDate,
      selectedIds,
      allChecked,
      exportImg,
      batchDownload,
      deleteItem
    };
  }
}).use(ElementPlus).mount("#admin-app");