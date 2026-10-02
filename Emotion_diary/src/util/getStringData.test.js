import {describe, it, expect} from "vitest";
import {getStringedData} from "./getStringData";

describe("getStringedData", ()=>{
    it("should return string data", ()=>{
        expect(getStringedData(new Date(2026, 0, 5))).toBe("2026-01-05");
    });
});