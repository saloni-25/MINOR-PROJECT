import React, { useState } from "react";

export default function CYKWebsite() {
  const [grammarText, setGrammarText] = useState("S -> AB\nA -> a\nB -> b");
  const [inputString, setInputString] = useState("ab");
  const [tableOutput, setTableOutput] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState("");

  // Parse grammar text
  function parseGrammar(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l);
    const grammar = [];
    for (const line of lines) {
      const parts = line.split("->");
      if (parts.length !== 2) return { error: `Invalid rule: ${line}` };
      grammar.push([parts[0].trim(), parts[1].trim()]);
    }
    return { grammar };
  }

  // Check Chomsky Normal Form
  function checkCNF(grammar) {
    const vars = {};
    for (const [left, right] of grammar) {
      if (left.length !== 1 || left !== left.toUpperCase())
        return { ok: false, message: `Left side must be uppercase: ${left}` };
      if (!(right.length === 1 && right === right.toLowerCase()) &&
          !(right.length === 2 && right[0].toUpperCase() === right[0] && right[1].toUpperCase() === right[1]))
        return { ok: false, message: `Right side invalid: ${right}` };
      vars[left] = true;
    }
    for (const [, right] of grammar)
      for (const ch of right)
        if (ch >= "A" && ch <= "Z" && !vars[ch])
          return { ok: false, message: `Variable ${ch} used but not defined` };
    return { ok: true };
  }

  // CYK algorithm
  function cykJS(s, grammar) {
    const n = s.length;
    const table = Array.from({ length: n }, () => Array(n).fill(""));
    const rulesByRHS = {};
    for (const [L, R] of grammar) {
      if (!rulesByRHS[R]) rulesByRHS[R] = [];
      rulesByRHS[R].push(L);
    }

    // length 1
    for (let i = 0; i < n; i++) table[i][i] = (rulesByRHS[s[i]] || []).join("");

    // length 2+
    for (let length = 2; length <= n; length++) {
      for (let i = 0; i + length - 1 < n; i++) {
        const j = i + length - 1;
        const cellVars = new Set();
        for (let split = i; split < j; split++) {
          for (const A of table[i][split]) {
            for (const B of table[split + 1][j]) {
              const pair = A + B;
              if (rulesByRHS[pair]) rulesByRHS[pair].forEach(P => cellVars.add(P));
            }
          }
        }
        table[i][j] = Array.from(cellVars).sort().join("");
      }
    }
    return table;
  }

  function handleRun() {
    setError(""); setTableOutput(null); setAccepted(null);
    const { grammar, error } = parseGrammar(grammarText);
    if (error) return setError(error);
    const cnf = checkCNF(grammar);
    if (!cnf.ok) return setError(cnf.message);
    if (!inputString) return setError("Input string cannot be empty");
    const table = cykJS(inputString, grammar);
    setTableOutput(table);
    setAccepted(table[0][inputString.length - 1].includes("S"));
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>CYK Algorithm — Interactive Demo</h1>

      <textarea
        value={grammarText}
        onChange={(e) => setGrammarText(e.target.value)}
        rows={5}
        style={{ width: "100%", fontFamily: "monospace", marginTop: 10 }}
      />

      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder="Enter string"
          style={{ marginRight: 10 }}
        />
        <button onClick={handleRun}>Run CYK</button>
      </div>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      {tableOutput && (
        <div style={{ marginTop: 20 }}>
          <div>Result: {accepted ? "ACCEPTED" : "REJECTED"}</div>
          <div style={{ marginTop: 10 }}>
            <table border="1" cellPadding="4">
              <tbody>
                {tableOutput.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ minWidth: 20, textAlign: "center" }}>{cell || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
