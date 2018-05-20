function delay(expressionAsFunction) {
    var result;
    var isEvaluated = false;
  
    return function () {
      if (!isEvaluated) {
        result = expressionAsFunction();
        isEvaluated = true;
      }
      return result;
    };
}
  
function force(promise) {
    return promise();
}