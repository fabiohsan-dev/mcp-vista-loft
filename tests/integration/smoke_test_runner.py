import subprocess
import json
import os
import time
import sys

def run_process(env_vars):
    return subprocess.Popen(
        ["node", "dist/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env_vars
    )

def send_rpc(process, method, params=None, req_id=1):
    req = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": method,
        "params": params or {}
    }
    process.stdin.write(json.dumps(req) + "\n")
    process.stdin.flush()
    line = process.stdout.readline()
    return json.loads(line) if line else None

def run_smoke_test():
    # 1. Validação de Ambiente
    vista_url = os.getenv("VISTA_URL")
    vista_key = os.getenv("VISTA_KEY")

    if not vista_url or not vista_key:
        print("❌ ERRO: VISTA_URL e VISTA_KEY devem estar no ambiente para o Smoke Test.")
        sys.exit(1)

    test_env = os.environ.copy()
    test_env["NODE_ENV"] = "test"

    print(f"🚀 Iniciando Smoke Test do MCP Server Vista CRM (URL: {vista_url.split('//')[1]})")
    
    process = run_process(test_env)
    results = {}

    try:
        time.sleep(2)
        if process.poll() is not None:
            raise Exception("Processo morreu no bootstrap.")
        
        results["1_bootstrap"] = "PASS"
        print("✔ [1/7] Bootstrap: Servidor ativo.")

        # 2. INITIALIZE
        resp = send_rpc(process, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "smoke-tester", "version": "1.0.0"}
        })
        if resp and "result" in resp:
            results["2_initialize"] = "PASS"
            print("✔ [2/7] Initialize: Handshake concluído.")
        else:
            results["2_initialize"] = "FAIL"

        # 3. LIST TOOLS
        resp = send_rpc(process, "tools/list", req_id=2)
        tools = resp.get("result", {}).get("tools", [])
        if len(tools) >= 30:
            results["3_list_tools"] = "PASS"
            print(f"✔ [3/7] List Tools: {len(tools)} ferramentas encontradas.")
        else:
            results["3_list_tools"] = "FAIL"

        # 4. CALL TOOL (SUCCESS)
        resp = send_rpc(process, "tools/call", {
            "name": "imoveis_pesquisar",
            "arguments": {"paginacao": {"quantidade": 1}}
        }, req_id=3)
        if resp and "result" in resp and not resp["result"].get("isError"):
            results["4_call_tool_success"] = "PASS"
            print("✔ [4/7] Call Tool (Success): Dados recebidos.")
        else:
            results["4_call_tool_success"] = "FAIL"

        # 5. CONTROLLED ERROR (ZOD)
        resp = send_rpc(process, "tools/call", {
            "name": "imoveis_pesquisar",
            "arguments": {"paginacao": {"quantidade": -1}}
        }, req_id=4)
        if resp and (resp.get("error") or resp.get("result", {}).get("isError")):
            results["5_controlled_error"] = "PASS"
            print("✔ [5/7] Controlled Error: Input inválido bloqueado via Zod.")
        else:
            results["5_controlled_error"] = "FAIL"

        # 6. API RESILIENCE (REAL FAILURE TEST)
        print("🔍 Testando resiliência contra falha de autenticação...")
        fail_env = test_env.copy()
        fail_env["VISTA_KEY"] = "INVALID_KEY_FOR_TEST"
        fail_process = run_process(fail_env)
        time.sleep(1)
        
        # Envia initialize para o processo de falha
        send_rpc(fail_process, "initialize")
        
        resp_fail = send_rpc(fail_process, "tools/call", {
            "name": "imoveis_pesquisar",
            "arguments": {"paginacao": {"quantidade": 1}}
        })
        
        # Deve retornar isError: true e NÃO deve conter a palavra "key" ou o valor da key no erro
        if resp_fail and resp_fail.get("result", {}).get("isError"):
            error_msg = str(resp_fail["result"].get("content", []))
            if "INVALID_KEY_FOR_TEST" not in error_msg:
                results["6_api_resilience"] = "PASS"
                print("✔ [6/7] API Resilience: Erro de autenticação tratado com segurança.")
            else:
                results["6_api_resilience"] = "FAIL (Key leaked in error message)"
        else:
            results["6_api_resilience"] = "FAIL (No error returned for invalid key)"
        fail_process.terminate()

        # 7. STABILITY
        if process.poll() is None:
            results["7_stability"] = "PASS"
            print("✔ [7/7] Stability: Servidor resiliente após múltiplas chamadas.")
        else:
            results["7_stability"] = "FAIL"

    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        process.terminate()
        return results

if __name__ == "__main__":
    res = run_smoke_test()
    if all(v == "PASS" for v in res.values()):
        print("\n✅ STATUS FINAL: VALIDADO")
        sys.exit(0)
    else:
        print("\n❌ STATUS FINAL: REPROVADO")
        print(json.dumps(res, indent=2))
        sys.exit(1)
