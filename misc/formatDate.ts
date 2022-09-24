const formatDate = (date: Date) => {
  return date.toString().split("T")[0].split("-").reverse().join("/");
}

export default formatDate;