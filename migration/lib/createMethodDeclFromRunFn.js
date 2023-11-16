import { assert } from 'console';
import { nullTransformationContext } from './nullTransformationContext.js';
import ts from 'typescript';
export function createMethodDeclFromRunFn(runFunctionDecl, className) {
    assert(runFunctionDecl.parameters.length < 3, `Expected 3 params in the run function, got ${runFunctionDecl.parameters.length}`);
    let { body } = runFunctionDecl;
    const { parameters, name } = runFunctionDecl;
    if (parameters.length > 0) {
        const interimRunFnDecl = migrateRunFnParamsToObjectBindingPattern(runFunctionDecl, className);
        ({ body } = updatePropertyAccessChainsToOmitParamNames(interimRunFnDecl));
    }
    const metdodDecl = ts.factory.createMethodDeclaration([ts.factory.createModifier(ts.SyntaxKind.PublicKeyword), ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)], undefined, name.text, undefined, undefined, undefined, ts.factory.createTypeReferenceNode('Promise', [ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)]), body);
    return metdodDecl;
}
function migrateRunFnParamsToObjectBindingPattern(runFunctionDecl, className) {
    const [contextParam, herokuParam] = runFunctionDecl.parameters; // could be named anything so we'll grab names from the identifiers
    //-------------------
    // const {flags, argv} = await this.parse(ClassName)
    //-------------------
    // this.parse
    const thisDotParse = ts.factory.createPropertyAccessExpression(ts.factory.createThis(), 'parse');
    // this.parse(ClassName)
    const callThisDotParse = ts.factory.createCallExpression(thisDotParse, undefined, [className]);
    // await this.parse(ClassName)
    const awaitCallThisDotParse = ts.factory.createAwaitExpression(callThisDotParse);
    // {flags, argv}
    const bindingElements = [ts.factory.createBindingElement(undefined, undefined, contextParam.name)];
    if (herokuParam) {
        bindingElements.push(ts.factory.createBindingElement(undefined, undefined, herokuParam.name));
    }
    const objectBindingPattern = ts.factory.createObjectBindingPattern(bindingElements);
    // const {flags, argv} = await this.parse(ClassName)
    const variableDecl = ts.factory.createVariableDeclaration(objectBindingPattern, undefined, undefined, awaitCallThisDotParse);
    const variableDeclList = ts.factory.createVariableDeclarationList([variableDecl]);
    return ts.factory.updateFunctionDeclaration(runFunctionDecl, runFunctionDecl.modifiers, runFunctionDecl.asteriskToken, runFunctionDecl.name, runFunctionDecl.typeParameters, runFunctionDecl.parameters, runFunctionDecl.type, ts.factory.updateBlock(runFunctionDecl.body, [ts.factory.createVariableStatement(undefined, variableDeclList), ...runFunctionDecl.body.statements]));
}
function updatePropertyAccessChainsToOmitParamNames(runFunctionDecl) {
    const visitor = (node) => {
        node = ts.visitEachChild(node, visitor, nullTransformationContext);
        // context.flags ---> flags
        if (isPropertyAccessExpressionThatMatchesParamName(node, runFunctionDecl.parameters)) {
            return node.name;
        }
        return node;
    };
    return ts.visitEachChild(runFunctionDecl, visitor, nullTransformationContext);
}
function isPropertyAccessExpressionThatMatchesParamName(node, params) {
    return params.some(param => ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && (node.expression.escapedText === param.name.escapedText));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlTWV0aG9kRGVjbEZyb21SdW5Gbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmVhdGVNZXRob2REZWNsRnJvbVJ1bkZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUE7QUFDOUIsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sZ0NBQWdDLENBQUE7QUFDeEUsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRTNCLE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxlQUF1QyxFQUFFLFNBQXdCO0lBQ3pHLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsOENBQThDLGVBQWUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUVoSSxJQUFJLEVBQUMsSUFBSSxFQUFDLEdBQUcsZUFBZSxDQUFBO0lBQzVCLE1BQU0sRUFBQyxVQUFVLEVBQUUsSUFBSSxFQUFDLEdBQUcsZUFBZSxDQUFBO0lBQzFDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDekIsTUFBTSxnQkFBZ0IsR0FBRyx3Q0FBd0MsQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDOUYsQ0FBQyxFQUFDLElBQUksRUFBQyxHQUFHLDBDQUEwQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQTtLQUN4RTtJQUVELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsRUFDbkssU0FBUyxFQUNULElBQUksQ0FBQyxJQUFJLEVBQ1QsU0FBUyxFQUNU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