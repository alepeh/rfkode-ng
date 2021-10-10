import {Parser} from 'expr-eval';

export function evaluate(expr : string, data : any) : any {
    const result = Parser.evaluate(expr, data);
    return result;
}