import ts from 'typescript';
export function isRequireVarDecl(node) {
    const [maybeRequireDecl] = node.declarations;
    return (ts.isVariableDeclaration(maybeRequireDecl) &&
        ts.isCallExpression(maybeRequireDecl.initializer) &&
        ts.isIdentifier(maybeRequireDecl.initializer.expression) &&
        maybeRequireDecl.initializer.expression.text === 'require');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNSZXF1aXJlVmFyRGVjbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pc1JlcXVpcmVWYXJEZWNsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUUzQixNQUFNLFVBQVUsZ0JBQWdCLENBQUMsSUFBZ0M7SUFDL0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQTtJQUM1QyxPQUFPLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDO1FBQy9DLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7UUFDOUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDO1FBQ3hELGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFBO0FBQ25FLENBQUMifQ==