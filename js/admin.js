import { createApp, ref, onMounted } from "vue";
import ElementPlus from "https://cdn.jsdelivr.net/npm/element-plus@2.8.0/dist/index.full.js";
import { db } from "./cloudbase.js";

createApp({
  setup(){
    const pwd = ref("");
    const logged = ref(false);
    const list = ref([]);
    const batchShow = ref(false);
    const selDate = ref("");
    const fList = ref([]);
    const checkedIds = ref([]);
    const checkAll = ref(false);

    const ADMIN_PWD = "admin123456";

    const login = () => {
      if(pwd.value===ADMIN_PWD){ logged.value=true; loadList(); ElMessage.success("登录成功"); }
      else ElMessage.error("密码错误");
    };

    const loadList = async () => {
      const res = await db.collection("loan_orders").orderBy("createTime","desc").get();
      list.value = res.data;
    };

    const del = async (id) => {
      await db.collection("loan_orders").doc(id).remove();
      ElMessage.success("已删除");
      loadList();
    };

    const exportOne = async (idx, item) => {
      const d = document.createElement("div");
      d.style.width="800px";d.style.padding="24px";d.style.border="1px solid #000";
      const rows = [
        ["序号："+idx, "提交日期："+item.submitTime],
        ["借款学生姓名：", item.stuName], ["身份证号：", item.idCard], ["手机号：", item.phone],
        ["户籍（区）：", item.district], ["户籍（镇/街道）：", item.street], ["高校(全称)：", item.school],
        ["专业：", item.major], ["学历：", item.education], ["学制（年）：", item.studyYear],
        ["本学年学费：", item.tuition], ["申请贷款金额：", item.loanMoney], ["困难情况：", item.familyStatus],
        ["共同借款人：", item.guaranteeName], ["关系：", item.relation], ["共同借款人年龄：", item.guaranteeAge],
        ["共同借款人手机：", item.guaranteePhone], ["办理项目：", item.handleType], ["预约日期：", item.orderDate],
        ["预约时段：", item.orderTime]
      ];
      rows.forEach(([a,b])=>{
        const r=document.createElement("div");r.style.display="flex";r.style.margin="4px 0";
        const c1=document.createElement("div");c1.style.padding="0 4px";c1.style.minWidth="160px";c1.innerText=a;
        const c2=document.createElement("div");c2.style.padding="0 4px";c2.style.flex=1;c2.innerText=b;
        r.append(c1,c2);d.append(r);
      });
      document.body.appendChild(d);
      const canvas = await html2canvas(d);
      const a = document.createElement("a");
      const date = item.submitTime.split(" ")[0];
      a.download = `${idx}-${date}-${item.stuName}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      document.body.removeChild(d);
    };

    const openBatch = () => { batchShow.value=true; fList.value=[]; checkedIds.value=[]; };
    const filterDate = () => {
      if(!selDate.value) return ElMessage.warning("选日期");
      fList.value = list.value.filter(t=>t.orderDate===selDate.value).map(t=>{
        const date = t.submitTime.split(" ")[0];
        return {...t, fileName: `${list.value.findIndex(s=>s._id===t._id)+1}-${date}-${t.stuName}`};
      });
    };
    const checkAllChange = () => {
      if(checkAll.value) checkedIds.value = fList.value.map(t=>t._id);
      else checkedIds.value = [];
    };
    const batchExport = async () => {
      for(const id of checkedIds.value){
        const item = list.value.find(t=>t._id===id);
        const idx = list.value.findIndex(t=>t._id===id)+1;
        await exportOne(idx,item);
        await new Promise(r=>setTimeout(r,800));
      }
    };

    onMounted(()=>{});
    return { pwd, logged, login, list, del, exportOne, openBatch, batchShow, selDate, fList, checkedIds, checkAll, filterDate, checkAllChange, batchExport };
  }
}).use(ElementPlus).mount("#app");