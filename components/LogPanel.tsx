import React, { useEffect, useRef, useState } from 'react';
import { getLogs, createRecord, deleteRecord, updateRecord, getRecords, exportAllRecordsCSV, logAction } from '../services/db';
import { LogEntry } from '../types';
import { Terminal, ChevronDown, ChevronUp, Send, Copy, Check, Mic, MicOff } from 'lucide-react';

export const LogPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const fetchLogs = () => {
    setLogs(getLogs());
  };

  useEffect(() => {
    fetchLogs();
    // Poll for logs every 2 seconds
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [logs, isOpen]);

  // --- Voice Recognition Logic ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            logAction('SYSTEM', '🎙️ Listening for voice command...');
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            
            setCommand(transcript);

            if (event.results[0].isFinal) {
                const interpretedCommand = processNaturalLanguage(transcript);
                if (interpretedCommand !== transcript) {
                    logAction('SYSTEM', `🤖 AI Interpreted: "${transcript}" -> "${interpretedCommand}"`);
                }
                executeCommand(interpretedCommand);
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            logAction('ERROR', `Voice Error: ${event.error}`);
            setIsListening(false);
        };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        if (!isOpen) setIsOpen(true);
        recognitionRef.current?.start();
    }
  };

  // --- Natural Language Processor (Simple AI) ---
  const processNaturalLanguage = (input: string): string => {
    const lower = input.toLowerCase();

    // Pattern: "Create/Add record name [Name] email [Email] ..."
    if (lower.includes('create') || lower.includes('add')) {
        let name = '';
        let email = '';
        let phone = '';

        // Extract Email
        const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch) email = emailMatch[0];

        // Extract Name (Heuristic: Text after "name" until "email" or "with")
        const nameMatch = input.match(/name\s+(.+?)\s+(?:email|with|and|$)/i);
        if (nameMatch) {
            name = nameMatch[1];
        } else if (!name && email) {
            // Fallback: If "name" keyword missing, take text between "add/create" and "email"
            const simpleMatch = input.match(/(?:create|add)(?:\s+record)?(?:\s+for)?\s+(.+?)\s+(?:email|with)/i);
            if (simpleMatch) name = simpleMatch[1];
        }
        
        // Extract Phone (simple digit matching)
        const phoneMatch = input.match(/phone\s+(\+?[\d\s-]{7,})/i);
        if (phoneMatch) phone = phoneMatch[1];

        // Construct Command
        if (name && email) {
            let cmd = `create -n "${name.trim()}" -e "${email.trim()}"`;
            if (phone) cmd += ` -p "${phone.trim()}"`;
            return cmd;
        }
    }

    if (lower.includes('list') || lower.includes('show records')) return 'list';
    if (lower.includes('export') || lower.includes('download')) return 'export';
    if (lower.includes('clear logs') || lower.includes('clear console')) return 'clear';
    if (lower.includes('help')) return 'help';
    if (lower.includes('generate') && lower.includes('data')) return 'create -n "Sample User" -e "sample@test.com"'; // Easter egg shortcut

    return input; // Return original if no fancy match found
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
  };

  const executeCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommand('');

    logAction('SYSTEM', `> ${cmd}`);

    try {
      await processCommand(cmd);
    } catch (err: any) {
      logAction('ERROR', `Command Failed: ${err.message}`);
    }
    
    fetchLogs();
  };

  // Basic Command Parser
  const processCommand = async (input: string) => {
    const args = input.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(s => s.replace(/^"|"$/g, '')) || [];
    if (args.length === 0) return;

    const action = args[0].toLowerCase();
    
    switch (action) {
      case 'help':
        logAction('SYSTEM', 'Available Commands:');
        logAction('SYSTEM', '  list : View recent records');
        logAction('SYSTEM', '  create -n [Name] -e [Email] -p [Phone] : Add record');
        logAction('SYSTEM', '  update [ID] -n [Name] ... : Update record');
        logAction('SYSTEM', '  delete [ID] : Delete record');
        logAction('SYSTEM', '  export : Download CSV');
        logAction('SYSTEM', '  clear : Clear console view');
        logAction('SYSTEM', '  Voice AI: Click Mic and say "Create record name John email john@test.com"');
        break;

      case 'clear':
         logAction('SYSTEM', '--- CONSOLE CLEARED ---');
         break;

      case 'list':
        const records = await getRecords();
        if (records.length === 0) {
          logAction('SYSTEM', 'Database is empty.');
        } else {
          logAction('SYSTEM', `Found ${records.length} records. Showing last 5:`);
          records.slice(0, 5).forEach(r => {
             logAction('SYSTEM', `[${r.id}] ${r.name} (${r.email})`);
          });
        }
        break;

      case 'export':
        await exportAllRecordsCSV();
        break;

      case 'delete':
        if (args.length < 2) throw new Error("Usage: delete [ID]");
        await deleteRecord(args[1]);
        break;

      case 'create':
        const newData = parseArgs(args.slice(1));
        if (!newData.name || !newData.email) throw new Error("Name (-n) and Email (-e) are required.");
        await createRecord({
            name: newData.name,
            email: newData.email,
            phone: newData.phone || 'N/A',
            address: newData.address || 'N/A'
        });
        break;

      case 'update':
        if (args.length < 3) throw new Error("Usage: update [ID] -n [Name] ...");
        const updateId = args[1];
        const updates = parseArgs(args.slice(2));
        if (Object.keys(updates).length === 0) throw new Error("No fields to update provided.");
        await updateRecord(updateId, updates);
        break;

      default:
        throw new Error(`Unknown command '${action}'. Type 'help' or try voice commands.`);
    }
  };

  const parseArgs = (args: string[]) => {
    const data: any = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i+1]) data.name = args[i+1];
      if (args[i] === '-e' && args[i+1]) data.email = args[i+1];
      if (args[i] === '-p' && args[i+1]) data.phone = args[i+1];
      if (args[i] === '-a' && args[i+1]) data.address = args[i+1];
    }
    return data;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const handleCopyLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const logText = logs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.action} ${l.details}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogColor = (action: LogEntry['action']) => {
    switch (action) {
      case 'ERROR': return 'text-red-400';
      case 'CREATE': return 'text-green-400';
      case 'DELETE': return 'text-orange-400';
      case 'UPDATE': return 'text-blue-400';
      case 'LOGIN': return 'text-purple-400';
      case 'SYSTEM': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const canUseMic = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className={`fixed bottom-0 right-4 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-full md:w-[600px]' : 'w-auto'}`}>
      <div className={`bg-gray-900 border rounded-t-xl shadow-2xl overflow-hidden flex flex-col transition-colors ${isListening ? 'border-red-500 shadow-red-900/50' : 'border-gray-700'}`}>
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors border-b border-gray-700 select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 text-gray-300 text-sm font-mono">
            <Terminal size={16} className={isListening ? 'text-red-500 animate-pulse' : 'text-primary'} />
            <span className="font-bold">
                {isListening ? 'Listening...' : 'Command AI & Logs'}
            </span>
            {logs.length > 0 && !isListening && (
              <span className="bg-primary text-white text-[10px] px-1.5 rounded-full">{logs.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyLogs}
              className="p-1.5 hover:bg-gray-600 rounded-md text-gray-400 hover:text-white transition-colors flex items-center gap-1 group"
              title="Copy all logs"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
            {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
          </div>
        </div>

        {/* Log Content */}
        {isOpen && (
          <>
            <div className="h-64 bg-black/95 p-4 overflow-y-auto logs-scrollbar font-mono text-xs select-text">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">
                  System initialized. Waiting for commands... <br/>
                  Type <span className="text-cyan-400">help</span> or use <span className="text-red-400">Mic</span> to speak.
                </div>
              ) : (
                logs.slice().reverse().map((log) => (
                  <div key={log.id} className="mb-1 pl-2 py-0.5 border-l-2 border-transparent hover:border-gray-700 transition-colors break-words">
                    <span className="text-gray-600 mr-2">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={`font-bold mr-2 ${getLogColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-gray-300 whitespace-pre-wrap">
                      {log.details}
                    </span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Command Input Area */}
            <form onSubmit={handleCommandSubmit} className="bg-gray-800 p-2 flex items-center gap-2 border-t border-gray-700">
                <div className={`font-bold select-none pl-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
                    {isListening ? '●' : '>'}
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Type command or click Mic..."}
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder-gray-600"
                    autoComplete="off"
                />
                
                {canUseMic && (
                    <button 
                        type="button" 
                        onClick={toggleListening}
                        className={`p-1.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        title="Toggle Voice Control"
                    >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                )}
                
                <button type="submit" className="p-1.5 text-gray-400 hover:text-white transition-colors">
                    <Send size={16} />
                </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};