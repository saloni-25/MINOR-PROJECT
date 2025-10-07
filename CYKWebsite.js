import React, { useState } from "react";

export default function CYKWebsite() {
  const [grammarText, setGrammarText] = useState(
`S -> AB
A -> a
B -> b`
  );
  const [inputString, setInputString] = useState("ab");
  const [tableOutput, setTableOutput] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState("");

  // Parse grammar text into array [LHS, RHS]
  function parseGrammar(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const grammar = [];
    for (const line of lines) {
      const parts = line.split("->");
      if (parts.length !== 2) return { error: `Invalid rule: ${line}` };
      grammar.push([parts[0].trim(), parts[1].trim()]);
    }
    return { grammar };
  }

  function checkCNF(grammar) {
    const vars = {};
    for (const [left, right] of grammar) {
      if (left.length !== 1 || left !== left.toUpperCase()) return { ok: false, message: `Left must be single uppercase: ${left}` };
      if (right.length === 1 && right !== right.toLowerCase()) return { ok: false, message: `Single terminal must be lowercase: ${right}` };
      if (right.length === 2 && (!right[0].match(/[A-Z]/) || !right[1].match(/[A-Z]/))) return { ok: false, message: `Two variables must be uppercase: ${right}` };
      if (right.length !== 1 && right.length !== 2) return { ok: false, message: `Right side must be 1 or 2 symbols: ${right}` };
      vars[left] = true;
    }
    for (const [, right] of grammar) {
      for (const ch of right) {
        if (ch >= "A" && ch <= "Z" && !vars[ch]) return { ok: false, message: `Variable ${ch} used but not defined` };
      }
    }
    return { ok: true };
  }

  function cykJS(s, grammar) {
    const n = s.length;
    const table = Array.from({ length: n }, () => Array(n).fill(""));
    const rulesByRHS = {};
    for (const [L, R] of grammar) {
      if (!rulesByRHS[R]) rulesByRHS[R] = [];
      rulesByRHS[R].push(L);
    }

    // Length 1
    for (let i = 0; i < n; i++) {
      const ch = s[i];
      table[i][i] = (rulesByRHS[ch] || []).sort().join("");
    }

    // Lengths 2..n
    for (let length = 2; length <= n; length++) {
      for (let i = 0; i + length - 1 < n; i++) {
        const j = i + length - 1;
        const cellVars = new Set();
        for (let split = i; split < j; split++) {
          const leftVars = table[i][split];
          const rightVars = table[split + 1][j];
          for (const A of leftVars) {
            for (const B of rightVars) {
              const pair = A + B;
              (rulesByRHS[pair] || []).forEach(P => cellVars.add(P));
            }
          }
        }
        table[i][j] = Array.from(cellVars).sort().join("");
      }
    }
    return table;
  }

  function handleRun() {
    setError("");
    setTableOutput(null);
    setAccepted(null);
    const { grammar, error } = parseGrammar(grammarText);
    if (error) return setError(error);
    const cnf = checkCNF(grammar);
    if (!cnf.ok) return setError(cnf.message);
    if (!inputString) return setError("Input string cannot be empty");
    const table = cykJS(inputString.trim(), grammar);
    setTableOutput(table);
    setAccepted(table[0][inputString.length - 1].includes("S"));
  }

  return (
    <div>
      <h1>CYK Algorithm — Interactive Demo</h1>
      <textarea
        rows={6}
        cols={30}
        value={grammarText}
        onChange={e => setGrammarText(e.target.value)}
      />
      <br />
      <input
        type="text"
        value={inputString}
        onChange={e => setInputString(e.target.value)}
        placeholder="Enter string"
      />
      <button onClick={handleRun}>Run CYK</button>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {tableOutput && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result: {accepted ? "ACCEPTED" : "REJECTED"}</h3>
          <div>
            {tableOutput.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: "10px" }}>
                {row.map((cell, j) => (
                  <div key={j} style={{ border: "1px solid black", padding: "5px" }}>
                    {cell || "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
