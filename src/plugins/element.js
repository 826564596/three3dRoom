import Vue from "vue";
import { Dialog, Alert, MessageBox, Message, Button, Image, Tag, Progress } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";

Vue.use(Dialog);
Vue.use(Button);
Vue.use(Image);
Vue.use(Tag);
Vue.use(Progress);

// Vue.use(Alert);
// Vue.use(MessageBox);
// Vue.use(Message);

Vue.prototype.$alert = Alert;
Vue.prototype.$message = Message;
Vue.prototype.$messageBox = MessageBox;

// Vue.use(Message);

// Vue.prototype.$message = {
//     error(msg) {
//         Message.closeAll();
//         Message.error(msg);
//     },
//     success(msg) {
//         Message.closeAll();
//         Message.success(msg);
//     },
// };
