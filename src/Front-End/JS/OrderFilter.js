import { reactive } from "vue";

export function useOrderFilter(emit) {
  const form = reactive({
    keyword: "",
    status: "all",
    type: "all",
    fromDate: "",
    toDate: "",
  });

  function apply() {
    if (form.fromDate && form.toDate && form.fromDate > form.toDate) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    emit("apply", {
      keyword: form.keyword.trim(),
      status: form.status,
      type: form.type,
      fromDate: form.fromDate || null,
      toDate: form.toDate || null,
    });
  }

  function reset() {
    form.keyword = "";
    form.status = "all";
    form.type = "all";
    form.fromDate = "";
    form.toDate = "";

    emit("reset");
    apply();
  }

  return { form, apply, reset };
}
