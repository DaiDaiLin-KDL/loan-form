import { createApp, ref, onMounted, watch } from "vue";
import ElementPlus from "https://cdn.jsdelivr.net/npm/element-plus@2.8.0/dist/index.full.js";
import { db } from "./cloudbase.js";

const app = createApp({
  setup() {
    const formRef = ref(null);
    const submitting = ref(false);
    const timeDisabled = ref([false,false,false,false]);

    const form = ref({
      stuName:"",idCard:"",phone:"",district:"",street:"",school:"",major:"",education:"",
      studyYear:"",tuition:"",loanMoney:"",familyStatus:"",guaranteeName:"",relation:"",
      guaranteeAge:"",guaranteePhone:"",handleType:"",orderDate:"",orderTime:""
    });

    const rules = ref({
      stuName: [{required:true,message:"必填",trigger:"blur"}],
      idCard: [{required:true,message:"必填",trigger:"blur"}],
      phone: [{required:true,message:"必填",trigger:"blur"}],
      district: [{required:true,message:"必选",trigger:"change"}],
      street: [{required:true,message:"必选",trigger:"change"}],
      school: [{required:true,message:"必填",trigger:"blur"}],
      major: [{required:true,message:"必填",trigger:"blur"}],
      education: [{required:true,message:"必选",trigger:"change"}],
      studyYear: [{required:true,message:"必填",trigger:"blur"}],
      tuition: [{required:true,message:"必填",trigger:"blur"}],
      loanMoney: [{required:true,message:"必填",trigger:"blur"}],
      familyStatus: [{required:true,message:"必选",trigger:"change"}],
      guaranteeName: [{required:true,message:"必填",trigger:"blur"}],
      relation: [{required:true,message:"必选",trigger:"change"}],
      guaranteeAge: [{required:true,message:"必填",trigger:"blur"}],
      guaranteePhone: [{required:true,message:"必填",trigger:"blur"}],
      handleType: [{required:true,message:"必选",trigger:"change"}],
      orderDate: [{required:true,message:"必选",trigger:"change"}],
      orderTime: [{required:true,message:"必选",trigger:"change"}],
    });

    const disabledDate = (time) => {
      const s = new Date("2026-07-01"), e=new Date("2026-09-15"), d=time.getDay();
      return time<s || time>e || d===0 || d===6;
    };

    const limits = [3,2,3,2];
    const times = ["9:00-10:30","10:30-11:30","14:30-16:00","16:00-17:00"];

    watch(()=>form.value.orderDate, async ()=>{
      if(!form.value.orderDate) return;
      timeDisabled.value = [false,false,false,false];
      const snap = await db.collection("loan_orders").where({orderDate:form.value.orderDate}).get();
      const list = snap.data;
      [0,1,2,3].forEach(i=>{
        const cnt = list.filter(t=>t.orderTime===times[i]).length;
        if(cnt>=limits[i]) timeDisabled.value[i]=true;
      });
    });

    const submitForm = async () => {
      const valid = await formRef.value.validate().catch(()=>false);
      if(!valid) return ElMessage.warning("请完善必填项");
      submitting.value = true;
      try{
        const now = new Date();
        const submitTime = now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,0)+"-"+String(now.getDate()).padStart(2,0)+" "+String(now.getHours()).padStart(2,0)+":"+String(now.getMinutes()).padStart(2,0);
        await db.collection("loan_orders").add({...form.value, submitTime, createTime:db.serverDate()});
        window.location.href = `result.html?data=${encodeURIComponent(JSON.stringify(form.value))}&submitTime=${submitTime}`;
      }catch(err){
        ElMessage.error("提交失败："+err.message);
      }finally{
        submitting.value = false;
      }
    };

    return {form, rules, formRef, disabledDate, timeDisabled, submitForm, submitting};
  }
});
app.use(ElementPlus).mount("#app");