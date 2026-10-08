import type { AutopsyResponse, CauseId, RebirthResponse } from "./types";

/** 演示用「遗体」：2015 年风格的 jQuery 回调地狱登录函数 */
export const DEMO_CODE = `function doLogin(u, p, cb) {
  if (u == "" || p == "") { alert("不能为空"); return; }
  $.ajax({
    url: "/api/login",
    data: { user: u, pwd: p },
    success: function (d) {
      if (d.code == 0) {
        $.ajax({
          url: "/api/userinfo",
          success: function (d2) {
            if (d2.code == 0) {
              localStorage.setItem("user", JSON.stringify(d2.data));
              // 别删，2016年加的，忘了干嘛的，删了登录不了
              setTimeout(function () {
                window.location.href = "/home?v=" + Math.random();
              }, 50);
              cb(d2.data);
            } else { alert(d2.msg); }
          }
        });
      } else { alert(d.msg); }
    },
    error: function () { alert("网络错误"); }
  });
}`;

export const DEMO_CAUSES: CauseId[] = ["pm", "legacy"];

export const DEMO_AUTOPSY: AutopsyResponse = {
  fallback: true,
  autopsy: {
    language: "JavaScript",
    lines: 27,
    time_of_death: "2016 年一个赶版本的周五深夜，此后它再没通过过一次 code review",
    direct_cause:
      "直接死因是三层嵌套回调引发的结构性心力衰竭：login 的 success 里套 userinfo 的 success，再套 setTimeout。尸检发现变量 d 与 d2 先后指代两种毫无血缘的返回值，是典型的命名系统塌陷；而 window.location.href 上拼接的 Math.random()，是它生前为对抗缓存留下的自残式补丁。",
    premortem: [
      "先后经历 18 次需求变更，从『记住我』到『扫码登录』再改回来，始终没死成",
      "那句『别删，2016年加的』的注释，是它一生中唯一被认真执行的遗言",
      "十年间被五个实习生读过，每人都在第 14 行停下，然后默默离开",
    ],
    smells: [
      "回调嵌套三层，else { alert(d.msg); } 缩进深得能看见地心",
      "cb 只在成功路径被调用，失败时调用方永远不知道发生了什么",
      "error 分支只有一句 alert(\"网络错误\")，把一切异常压成同一声叹息",
    ],
  },
  epitaph: "它没有 Bug，只有历史",
  reincarnation_advice: "愿它来世成为一条直线走过的 async 函数，每个错误都有名字，无需再等任何人。",
};

/** 四家殡葬师的演示悼词（按 model id 索引） */
export const DEMO_EULOGIES: Record<string, string> = {
  "deepseek/deepseek-chat":
    "各位，今天我们送走的不是代码，是一段工龄。它出生在 jQuery 还是主流的年代，三层回调是它的脊椎，alert 是它的声带。它一生最大的成就是那句注释——『别删，2016年加的，删了登录不了』，这是它留给这个世界唯一的文档。产品经理改了 18 次需求，它一次都没拒绝，因为它不会说话，只会嵌套。如今它终于不用再兼容 IE8 了。安息吧，老伙计，你的每一层缩进都会有人记得——毕竟没人敢动。",
  "openai/gpt-5-mini":
    "诸位同仁：今日到此的，是一段 27 行的登录逻辑。以工程学标准衡量，它存在三重结构性缺陷：回调嵌套违背控制流可读性原则；全局 $ 依赖构成隐式耦合；而 setTimeout 50 毫秒的重定向，本质是用竞态掩盖时序缺陷。然而必须承认，在其服役的十年间，它从未使一次登录失败扩散为事故。它以最不体面的结构，履行了最体面的职责。我们重构它，不是因为它错了，而是因为时代需要它能被接手。谨此。",
  "anthropic/claude-3-haiku":
    "它的一生，是不断等待的一生。等请求回来，等用户信息回来，再等五十毫秒——像一个人在门口等所有灯灭了才肯离开。没有人给它起过变量之外的名字，它叫 d，后来叫 d2，仿佛连自己是谁都要靠上下文猜。2016 年那个深夜，有人在它身体里留下一行注释，然后离开了。十年里，所有读到这里的人都会停一下，再绕开它走。今天，火会替我们把等待烧完。愿它来生不必等待，一调用，就有回应。",
  "google/gemini-2.0-flash":
    "说实话，今天来的不少人，都偷偷改过这段代码——然后又改回去了。它就 27 行，但没人真的『看懂』过它，大家只是『不敢动』它。alert 弹窗是它跟你打招呼的方式，随机数跳转是它的小脾气。它陪了三任产品经理、五个实习生，需求改了 18 回，它一行逻辑都没变过——变的只有注释里的日期。就这么着，它成了祖传的。行了，老东西，去火化吧。下辈子投个好人家，别再让人猜你是干啥的了。",
};

export function demoEulogyFor(model: string): string {
  return DEMO_EULOGIES[model] ?? Object.values(DEMO_EULOGIES)[0];
}

export const DEMO_REBIRTH: RebirthResponse = {
  fallback: true,
  refactored_code: `// 转世后：直线行走，错误有名，无人需要注释来避雷
async function doLogin(username, password) {
  if (!username || !password) {
    return { ok: false, reason: "EMPTY_INPUT" };
  }
  try {
    const login = await postJSON("/api/login", { user: username, pwd: password });
    if (login.code !== 0) return { ok: false, reason: "LOGIN_REJECTED", msg: login.msg };

    const info = await postJSON("/api/userinfo");
    if (info.code !== 0) return { ok: false, reason: "INFO_FAILED", msg: info.msg };

    localStorage.setItem("user", JSON.stringify(info.data));
    return { ok: true, user: info.data }; // 跳转交给调用方，路由不再藏在定时器里
  } catch (err) {
    return { ok: false, reason: "NETWORK_ERROR" };
  }
}`,
  changes: [
    "三层回调拉直为 async/await，控制流从嵌套变成直线",
    "cb 回调改为统一返回值，成功失败都有明确 reason，调用方不再被晾着",
    "删掉 setTimeout + Math.random() 的缓存玄学，跳转权交还调用方",
    "alert 全部移除，错误以结构化数据上抛，由 UI 层决定如何呈现",
  ],
  rebirth_as: "一段直线行走的 async 登录函数——错误有名，无人需要靠注释避雷",
};
