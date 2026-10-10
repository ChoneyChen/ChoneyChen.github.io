import { useI18n } from "../i18n";

export function LearningDetails({ course }: { course: "can201" | "isa305" }) {
  const { t } = useI18n();
  if (course === "can201") return <div className="learning-course">
    <div className="learning-highlight"><strong>82.5</strong><span>{t("CAN201 · Coursework 成绩", "CAN201 · coursework mark")}</span></div>
    <h3>{t("网络课程的团队交付", "A team delivery in computer networking")}</h3>
    <p>{t("我担任小组组长，组织课程项目交付。Gordon Owusu Boateng 是这门课的授课教师；课程合作随后延伸到车辆定位研究与毕业设计。", "I led the group and organised the coursework delivery. Gordon Owusu Boateng taught the course; our collaboration later developed into vehicle-localisation research and my dissertation.")}</p>
    <p className="learning-context">{t("记录范围：组长身份与课程成绩已确认。项目题目、网络拓扑和协议实现需原报告补齐。", "Record scope: my leadership role and coursework mark are confirmed. The original report is needed for the project title, network topology and protocol implementation.")}</p>
  </div>;
  return <div className="learning-course">
    <h3>{t("ISA305 · 从感知机到脑电分类", "ISA305 · From perceptrons to EEG classification")}</h3>
    <p>{t("使用 MATLAB、EEGLAB 与 BioSig，保留原始输出、分析错误，再修正实现。课程实验分别考察线性可分性、特征选择与训练测试边界。", "Using MATLAB, EEGLAB and BioSig, I retain raw outputs, inspect errors and revise the implementation. The experiments examine linear separability, feature selection and train/test boundaries.")}</p>
    <div className="learning-experiments">
      <section aria-label={t("Week 2 感知机实验", "Week 2 perceptron experiments")}>
        <h4>{t("Week 2 / 感知机与特征选择", "Week 2 / Perceptrons & feature selection")}</h4>
        <p>{t("EEG 特征实验使用 144 个左右手试次；下表 EEG 数值为训练准确率。", "The EEG feature experiments use 144 left/right-hand trials; the EEG values below are training accuracy.")}</p>
        <table><thead><tr><th>{t("条件", "Condition")}</th><th>{t("原始结果", "Recorded result")}</th></tr></thead><tbody>
          <tr><td>{t("线性可分数据", "Linearly separable data")}</td><td>{t("3 epochs · 0 个错误", "3 epochs · 0 errors")}</td></tr>
          <tr><td>{t("线性不可分数据", "Non-separable data")}</td><td>{t("100 epochs · 13 个错误", "100 epochs · 13 errors")}</td></tr>
          <tr><td>{t("EEG 两特征方案", "EEG two-feature baseline")}</td><td>75.69% <small>{t("训练准确率", "training accuracy")}</small></td></tr>
          <tr><td>{t("EEG 8–12 Hz mu-band", "EEG 8–12 Hz mu-band")}</td><td>67.36% <small>{t("训练准确率", "training accuracy")}</small></td></tr>
        </tbody></table>
      </section>
      <section aria-label={t("Week 4 EEG实验", "Week 4 EEG experiments")}>
        <h4>{t("Week 4 / EEG 运动想象分类", "Week 4 / EEG motor imagery")}</h4>
        <p>{t("BCI Competition IV 2a · A01T.gdf；22 通道，cue 后 0.5–3.5 秒，8–30 Hz 带通，左右手试次。144 trials：100 训练 / 44 测试。", "BCI Competition IV 2a · A01T.gdf; 22 channels, 0.5–3.5 seconds after the cue, 8–30 Hz bandpass, left/right-hand trials. 144 trials: 100 training / 44 test.")}</p>
        <table><thead><tr><th>{t("学习率", "Learning rate")}</th><th>{t("测试准确率", "Test accuracy")}</th></tr></thead><tbody>
          <tr><td>0.001</td><td>72.73%</td></tr><tr><td>0.01</td><td>77.27%</td></tr><tr><td>0.1</td><td>75.00%</td></tr>
        </tbody></table>
        <p className="learning-context">{t("CSP 与标准化仅使用训练数据拟合，再以 log-variance 特征分类；上述数值属于这组课程实验。", "CSP and standardisation were fitted on training data only, followed by classification using log-variance features. The values belong to this coursework experiment.")}</p>
      </section>
    </div>
  </div>;
}
