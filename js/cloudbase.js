// js/cloudbase.js
import cloudbase from "https://cdn.jsdelivr.net/npm/cloudbase-js-sdk@1.16.0/dist/cloudbase.esm.js";

const envId = "yuyue-system-d9g07g9ere49efe78";

cloudbase.init({
  env: envId,
  useIsolate: true, // 关键配置，绕过跨域校验
  persistence: "local"
});

const db = cloudbase.database();
export { cloudbase, db };