"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const ArrayUtil = {
    assignEmpty(target, ...sources) {
        sources.forEach(source => {
            Array.prototype.forEach.apply(source, (item, index) => {
                if (target[index] === null || target[index] === undefined) {
                    target[index] = item;
                }
            });
        });

        return target;
    }
};

exports.default = ArrayUtil;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdHMvQXJyYXlVdGlsLmpzIl0sIm5hbWVzIjpbIkFycmF5VXRpbCIsImFzc2lnbkVtcHR5IiwidGFyZ2V0Iiwic291cmNlcyIsImZvckVhY2giLCJzb3VyY2UiLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiaXRlbSIsImluZGV4IiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxNQUFNQSxZQUFZO0FBQ2RDLGdCQUFZQyxNQUFaLEVBQW9CLEdBQUdDLE9BQXZCLEVBQWdDO0FBQzVCQSxnQkFBUUMsT0FBUixDQUFnQkMsVUFBVTtBQUN0QkMsa0JBQU1DLFNBQU4sQ0FBZ0JILE9BQWhCLENBQXdCSSxLQUF4QixDQUE4QkgsTUFBOUIsRUFBc0MsQ0FBQ0ksSUFBRCxFQUFPQyxLQUFQLEtBQWlCO0FBQ25ELG9CQUFJUixPQUFPUSxLQUFQLE1BQWtCLElBQWxCLElBQTBCUixPQUFPUSxLQUFQLE1BQWtCQyxTQUFoRCxFQUEyRDtBQUN2RFQsMkJBQU9RLEtBQVAsSUFBZ0JELElBQWhCO0FBQ0g7QUFDSixhQUpEO0FBS0gsU0FORDs7QUFRQSxlQUFPUCxNQUFQO0FBQ0g7QUFYYSxDQUFsQjs7a0JBY2VGLFMiLCJmaWxlIjoib2JqZWN0cy9BcnJheVV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IEFycmF5VXRpbCA9IHtcbiAgICBhc3NpZ25FbXB0eSh0YXJnZXQsIC4uLnNvdXJjZXMpIHtcbiAgICAgICAgc291cmNlcy5mb3JFYWNoKHNvdXJjZSA9PiB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5hcHBseShzb3VyY2UsIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRbaW5kZXhdID09PSBudWxsIHx8IHRhcmdldFtpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbaW5kZXhdID0gaXRlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFycmF5VXRpbDtcbiJdfQ==
