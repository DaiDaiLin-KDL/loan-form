import { createApp, ref } from "vue";
import ElementPlus from "https://cdn.jsdelivr.net/npm/element-plus@2.8.0/dist/index.full.js";
import { db } from "./cloudbase.js";

createApp({
  setup() {
    const formRef = ref(null);
    const form = ref({
      stuName: "",
      idCard: "",
      phone: "",
      district: "",
      street: "",
      school: "",
      major: "",
      education: "",
      studyYear: "",
      tuition: "",
      loanMoney: "",
      familyStatus: "",
      guaranteeName: "",
      relation: "",
      guaranteeAge: "",
      guaranteePhone: "",
      handleType: "",
      orderDate: "",
      orderTime: ""
    });

    // 防重复提交（关键！解决1000人使用不报错）
    const isSubmitting = ref(false);

    // 校验规则
    const rules = ref({
      stuName: [{ required: true, message: "请输入借款学生姓名", trigger: "blur" }],
      idCard: [{ required: true, message: "请输入身份证号", trigger: "blur" }],
      phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
      district: [{ required: true, message: "请选择户籍区", trigger: "change" }],
      street: [{ required: true, message: "请选择镇/街道", trigger: "change" }],
      school: [{ required: true, message: "请输入高校全称", trigger: "blur" }],
      major: [{ required: true, message: "请输入专业", trigger: "blur" }],
      education: [{ required: true, message: "请选择学历", trigger: "change" }],
      studyYear: [{ required: true, message: "请输入学制", trigger: "blur" }],
      tuition: [{ required: true, message: "请输入本学年学费", trigger: "blur" }],
      loanMoney: [{ required: true, message: "请输入申请贷款金额", trigger: "blur" }],
      familyStatus: [{ required: true, message: "请选择家庭经济困难情况", trigger: "change" }],
      guaranteeName: [{ required: true, message: "请输入共同借款人姓名", trigger: "blur" }],
      relation: [{ required: true, message: "请选择关系", trigger: "change" }],
      guaranteeAge: [{ required: true, message: "请输入共同借款人年龄", trigger: "blur" }],
      guaranteePhone: [{ required: true, message: "请输入共同借款人手机号", trigger: "blur" }],
      handleType: [{ required: true, message: "请选择现场办理项目", trigger: "change" }],
      orderDate: [{ required: true, message: "请选择预约日期", trigger: "change" }],
      orderTime: [{ required: true, message: "请选择预约时段", trigger: "change" }]
    });

    // 日期禁用：2026-07-01 ~ 2026-09-15 + 周末不可选
    const disabledDate = (time) => {
      const start = new Date("2026-07-01");
      const end = new Date("2026-09-15");
      const day = time.getDay();
      return time < start || time > end || day === 0 || day === 6;
    };

    // 时段禁用
    const timeLimit1 = ref(false);
    const timeLimit2 = ref(false);
    const timeLimit3 = ref(false);
    const timeLimit4 = ref(false);

    // 提交表单（带防重复提交）
    const submitForm = async () => {
      // 正在提交 → 直接阻止
      if (isSubmitting.value) return;

      // 校验表单
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;

      // 开始提交
      isSubmitting.value = true;

      try {
        const now = new Date();
        const submitTime = now.getFullYear() + "-" +
          String(now.getMonth() + 1).padStart(2, '0') + "-" +
          String(now.getDate()).padStart(2, '0') + " " +
          String(now.getHours()).padStart(2, '0') + ":" +
          String(now.getMinutes()).padStart(2, '0');

        // 写入云数据库
        await db.collection("loan_orders").add({
          ...form.value,
          submitTime,
          createTime: db.serverDate()
        });

        // 跳转到结果页
        window.location.href = `result.html?data=${encodeURIComponent(JSON.stringify(form.value))}&submitTime=${submitTime}`;
      } finally {
        // 提交结束，解锁按钮
        isSubmitting.value = false;
      }
    };

    return {
      form,
      rules,
      formRef,
      disabledDate,
      submitForm,
      timeLimit1, timeLimit2, timeLimit3, timeLimit4
    };
  }
}).use(ElementPlus).mount("#app");