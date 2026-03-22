'use client'

import { useState } from 'react'

const SECTIONS = [
  {
    id: 'data-security',
    title: 'Data Security and Isolation',
    icon: '🔒',
    items: [
      {
        q: 'How is client data isolated?',
        a: 'Each client operates in a fully isolated data environment. Supabase Row Level Security (RLS) policies enforce strict per-client data boundaries at the database layer, so no query can return data belonging to another tenant. In addition, all client-generated files and artifacts are stored under a dedicated directory path scoped to that client\'s identifier (data/{client_id}/). These controls are architectural, not just application-level.'
      },
      {
        q: 'Is data encrypted in transit and at rest?',
        a: 'Yes. All data in transit is encrypted using TLS 1.2 or higher. All data at rest is encrypted using AES-256 via Supabase\'s managed encryption layer. There is no unencrypted path between any client system and the Taptico.AI platform.'
      },
      {
        q: 'Can agents from one client ever see another client\'s data?',
        a: 'No. The isolation is architectural. Agents are scoped to a single client context at instantiation. RLS policies at the database layer block any cross-tenant query, regardless of how the request is formed. Even in a misconfiguration scenario, the database enforces the boundary independently of application code.'
      },
      {
        q: 'Where is data stored?',
        a: 'Client data is stored in Supabase, hosted in the United States. Supabase maintains SOC 2 Type II certification for its managed infrastructure. Enterprise clients may request EU data residency under a separate data processing agreement.'
      }
    ]
  },
  {
    id: 'ai-agent-security',
    title: 'AI Agent Security',
    icon: '🤖',
    items: [
      {
        q: 'Who controls the AI agents?',
        a: 'Agents are configured entirely by the client. System prompts, capability flags, and operational boundaries are defined per client at setup. No agent takes any action without explicit client context. Agents do not operate on general-purpose defaults; they operate within the exact scope the client defines.'
      },
      {
        q: 'Can agents take actions outside their defined scope?',
        a: 'No. Delegation depth is capped at three levels, preventing unbounded agent-to-agent delegation chains. Agents cannot initiate external actions (API calls, emails, file writes) without explicit permission granted in their configuration. These constraints are enforced at the platform level, not left to individual agent prompts.'
      },
      {
        q: 'How are AI outputs reviewed before delivery?',
        a: 'All deliverables pass through a dedicated QA agent (Lucy) before reaching the client. Lucy runs an adversarial review protocol that checks for accuracy, scope adherence, and potential hallucinations. Outputs that do not meet defined quality thresholds are returned for revision before delivery.'
      },
      {
        q: 'What AI models does Taptico.AI use?',
        a: 'Taptico.AI is model-agnostic. The platform supports any frontier AI model the client selects, including models from Anthropic, OpenAI, and Google. Clients on Enterprise plans can specify a preferred model or bring their own model contracts.'
      },
      {
        q: 'Do AI providers see our data?',
        a: 'Yes, in part. When agents process tasks, prompts containing relevant context are sent to the configured AI provider. This is inherent to how large language models work. Taptico.AI uses AI providers that offer enterprise Data Processing Agreements (DPAs) and do not use customer data for model training by default. Clients should review their chosen provider\'s data policies directly. We can provide provider-specific documentation on request.'
      }
    ]
  },
  {
    id: 'access-controls',
    title: 'Access Controls',
    icon: '🛡️',
    items: [
      {
        q: 'How is authentication handled?',
        a: 'Authentication is managed via Supabase Auth. Multi-factor authentication (MFA) is enforced for all administrative access. Client portal access uses session-based authentication with configurable session expiry. API access requires signed tokens with defined scopes.'
      },
      {
        q: 'What is the principle of least privilege and how does it apply to agents?',
        a: 'Each agent is provisioned with a defined set of capability flags that specify exactly what actions it may take. No agent has access to capabilities beyond what its role requires. Capabilities are not inherited across agents; each agent\'s permission set is independently scoped. This means a reporting agent cannot trigger external sends, and a research agent cannot write to production data.'
      },
      {
        q: 'How is employee access managed?',
        a: 'Internal access to client environments follows role-based access control. Access is granted on a need-to-know basis and reviewed quarterly. When an employee is offboarded, all access is revoked within 24 hours. Access reviews are documented and retained for audit purposes.'
      }
    ]
  },
  {
    id: 'audit-logging',
    title: 'Audit Logging and Monitoring',
    icon: '📋',
    items: [
      {
        q: 'Is there an audit trail for agent activity?',
        a: 'Yes. All agent actions are logged to a tamper-evident JSONL audit log. Log entries include the agent identifier, action type, timestamp, input context hash, and output summary. Logs are append-only and cannot be modified after creation.'
      },
      {
        q: 'Can clients access their own logs?',
        a: 'Yes. Clients can access their audit logs via the Taptico.AI observability API using client-scoped authentication tokens. Log queries are bounded to the requesting client\'s data only. Enterprise clients can integrate log exports into their own SIEM or logging infrastructure.'
      },
      {
        q: 'How long are logs retained?',
        a: 'Audit logs are retained for a minimum of 90 days. Extended retention periods are available and configurable under Enterprise contracts. Clients requiring longer retention for compliance purposes should discuss this during onboarding.'
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance and Certifications',
    icon: '✅',
    items: [
      {
        q: 'What certifications does Taptico.AI hold?',
        a: 'Taptico.AI is currently completing its SOC 2 Type I audit, with a target completion date of Q2 2026. Our infrastructure runs on Supabase, which holds SOC 2 Type II certification. In the interim, we can provide our security controls documentation and respond to vendor security questionnaires.'
      },
      {
        q: 'Do you have a trust center?',
        a: 'Yes. Our Vanta-hosted trust center is in preparation and will be publicly available at trust.taptico.ai. In the meantime, contact security@taptico.ai to request our security documentation package.'
      },
      {
        q: 'Is Taptico.AI GDPR compliant?',
        a: 'Yes. Data processing agreements (DPAs) are available for all clients. EU data residency is available for clients on the Enterprise plan. We support data subject access requests and right-to-erasure workflows. Contact security@taptico.ai to initiate a DPA.'
      },
      {
        q: 'Can we conduct a security review or penetration test?',
        a: 'Yes. Taptico.AI supports customer-initiated security reviews under a coordinated disclosure agreement. Penetration testing requests should be submitted to security@taptico.ai. We will provide a testing agreement, define the authorized scope, and coordinate timing to avoid interference with other clients.'
      }
    ]
  },
  {
    id: 'incident-response',
    title: 'Incident Response',
    icon: '🚨',
    items: [
      {
        q: 'How does Taptico.AI handle security incidents?',
        a: 'Taptico.AI maintains a documented incident response plan. In the event of a confirmed security breach affecting client data, clients will be notified within 24 hours of confirmation. A post-mortem report detailing root cause, impact scope, and remediation steps will be delivered within 72 hours of incident resolution. All incidents are logged and retained for internal review.'
      },
      {
        q: 'Where do we report a suspected vulnerability?',
        a: 'Report suspected vulnerabilities to security@taptico.ai. Taptico.AI operates a responsible disclosure policy. We ask that researchers allow a reasonable remediation window before public disclosure. We will acknowledge receipt within one business day and provide a remediation timeline within five business days.'
      }
    ]
  },
  {
    id: 'vendor-supply-chain',
    title: 'Vendor and Supply Chain',
    icon: '🔗',
    items: [
      {
        q: 'What third parties have access to client data?',
        a: 'Two categories of third parties may process client data. First, the AI provider selected by the client (such as Anthropic or OpenAI) receives prompt data as part of task execution. Second, Supabase receives and stores structured data as the database provider. No other third party has access to client data without explicit client consent.'
      },
      {
        q: 'Does Taptico.AI conduct vendor security reviews?',
        a: 'Yes. Annual vendor risk assessments are conducted for all data processors. These assessments evaluate the vendor\'s security certifications, data handling practices, breach history, and contractual obligations. Results are used to inform ongoing vendor relationships and are available to Enterprise clients on request.'
      }
    ]
  }
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '18px 0',
          color: open ? '#ffffff' : 'rgba(255,255,255,0.85)',
          fontFamily: 'inherit',
          fontSize: '13.5px',
          fontWeight: 500,
          lineHeight: '1.55',
          transition: 'color 0.15s'
        }}
      >
        <span>{q}</span>
        <span style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `1px solid ${open ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2px',
          color: open ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s, border-color 0.15s'
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div style={{
          fontSize: '13px',
          color: '#8892a4',
          lineHeight: '1.75',
          paddingBottom: '18px',
          paddingRight: '36px'
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function SecurityPage() {
  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#0d1117',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '0 16px 80px'
    }}>
      {/* Header */}
      <header style={{
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        padding: '36px 0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 900,
          letterSpacing: '3px',
          color: '#4361ee',
          textTransform: 'uppercase'
        }}>
          Taptico
        </div>
        <a href="/" style={{ fontSize: '13px', color: '#8892a4', textDecoration: 'none' }}>
          Back to Home
        </a>
      </header>

      {/* Hero */}
      <section style={{
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        padding: '48px 0 40px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '2px',
          color: '#00f5d4',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          Security and Trust
        </div>

        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '16px'
        }}>
          Security FAQ
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#8892a4',
          lineHeight: 1.7,
          maxWidth: '580px',
          margin: 0
        }}>
          Technical security information for IT professionals, CISOs, and enterprise procurement teams
          evaluating Taptico.AI. This document covers data isolation, access controls, compliance posture,
          and incident response procedures.
        </p>

        {/* Badges */}
        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { icon: '🕐', text: 'Last updated: March 2026' },
            { icon: '📋', text: 'SOC 2 Type I in progress (Q2 2026)' },
            { icon: '🔒', text: 'AES-256 at rest / TLS 1.2+ in transit' }
          ].map(badge => (
            <span key={badge.text} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#8892a4',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              padding: '5px 10px'
            }}>
              <span>{badge.icon}</span>
              {badge.text}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: '28px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => alert('Security Overview PDF coming soon. Contact security@taptico.ai to request a copy.')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 18px',
              background: '#4361ee',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download Security Overview
          </button>
          <a
            href="mailto:security@taptico.ai?subject=CAIQ Lite Request"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 18px',
              background: 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              textDecoration: 'none',
              fontFamily: 'inherit'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 4.5L7 8l6-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Request CAIQ Lite
          </a>
        </div>
      </section>

      {/* FAQ Sections */}
      <main style={{ width: '100%', maxWidth: '760px', margin: '0 auto', paddingTop: '40px' }}>
        {SECTIONS.map((section) => (
          <div key={section.id} style={{ marginBottom: '8px' }}>
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '22px 0 10px',
              borderTop: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{
                fontSize: '18px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(67,97,238,0.12)',
                borderRadius: '8px',
                flexShrink: 0
              }}>
                {section.icon}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>
                {section.title}
              </div>
            </div>

            {/* FAQ card */}
            <div style={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '4px 24px',
              marginBottom: '8px'
            }}>
              {section.items.map((item, idx) => (
                <FAQItem key={idx} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{
          marginTop: '48px',
          background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '36px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              Have a security question not covered here?
            </h3>
            <p style={{ fontSize: '13px', color: '#8892a4', margin: 0 }}>
              Our security team responds to all inquiries within one business day.
            </p>
          </div>
          <a
            href="mailto:security@taptico.ai"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '11px 20px',
              background: '#4361ee',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              textDecoration: 'none',
              flexShrink: 0
            }}
          >
            Email security@taptico.ai
          </a>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', margin: 0 }}>
            Taptico.AI Security Documentation. Last reviewed March 2026.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="mailto:security@taptico.ai" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>
              security@taptico.ai
            </a>
            <a href="/privacy" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>
              Privacy Policy
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}
