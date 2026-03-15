/**
 * NUI Magazine — Dynamic OG Image Generator
 * /.netlify/functions/og-image
 * Version: 20260316v1
 *
 * Generates branded 1200x630 preview images for social sharing.
 * Covers: Twitter/X, Facebook, LinkedIn, iMessage, WhatsApp,
 *         Gmail, Outlook, Hotmail, Discord, Slack, Telegram
 *
 * Setup: npm install satori @resvg/resvg-js
 * Font:  Place Inter-Bold.ttf at /netlify/functions/fonts/Inter-Bold.ttf
 *        Download free: https://fonts.google.com/specimen/Inter
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Article data (mirrors magazine-data.js — keep in sync)
// Phase 2: replace with Supabase query
const ARTICLES = {
  'aj-photography-studio-detroit': {
    title: 'AJ Photography Studio: Detroit\'s Full-Service Photography Experience Since 2012',
    dek: 'From maternity portraits to weddings, throne chair rentals to 360 photobooths — capturing Detroit\'s moments since 2012.',
    category: 'Photography Studio',
    business: 'AJ Photography Studio',
    rating: 4.9, award: true, date: 'March 2026',
  },
  'larry-castleberry-detroit-storyteller-speaker': {
    title: 'Larry Castleberry: Detroit\'s Master Storyteller, Speaker, and Voice Actor',
    dek: 'Over 20 years bringing stories to life — engineering background, Aikido philosophy, and a voice that commands any room.',
    category: 'Storyteller & Speaker',
    business: 'Larry Castleberry',
    rating: 5.0, award: false, date: 'March 2026',
  },
};

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function buildTemplate({ title, dek, category, business, rating, award, date }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#0A0A0A', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif',
      },
      children: [
        // Red top bar
        { type: 'div', props: { style: { position:'absolute', top:0, left:0, right:0, height:8, background:'#ff0000' } } },
        // Subtle grid overlay
        { type: 'div', props: { style: {
          position:'absolute', inset:0,
          backgroundImage: 'linear-gradient(rgba(255,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}},
        // Main content
        { type: 'div', props: {
          style: { display:'flex', flexDirection:'column', flex:1, padding:'52px 60px 44px', position:'relative' },
          children: [
            // Top row
            { type: 'div', props: {
              style: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 },
              children: [
                // Wordmark
                { type: 'div', props: {
                  style: { display:'flex', alignItems:'baseline', gap:10 },
                  children: [
                    { type: 'span', props: { style: { fontSize:30, fontWeight:900, color:'#fff', letterSpacing:3 }, children: 'NUI' }},
                    { type: 'span', props: { style: { fontSize:14, fontWeight:700, color:'#ff0000', letterSpacing:8, textTransform:'uppercase' }, children: 'MAGAZINE' }},
                  ]
                }},
                // Category tag
                { type: 'div', props: {
                  style: { background:'rgba(255,0,0,0.15)', border:'1px solid rgba(255,0,0,0.4)', color:'#ff0000', fontSize:13, fontWeight:700, letterSpacing:2, textTransform:'uppercase', padding:'6px 18px' },
                  children: category
                }},
              ]
            }},
            // Kicker
            { type: 'div', props: {
              style: { display:'flex', alignItems:'center', gap:14, marginBottom:20 },
              children: [
                { type: 'div', props: { style: { width:36, height:2, background:'#ff0000' } } },
                { type: 'span', props: { style: { fontSize:12, fontWeight:700, color:'#ff0000', letterSpacing:5, textTransform:'uppercase' }, children: 'Featured Business · Detroit, MI' }},
              ]
            }},
            // Headline
            { type: 'div', props: { style: { fontSize:46, fontWeight:900, color:'#fff', lineHeight:1.0, letterSpacing:-0.5, marginBottom:20, maxWidth:940 }, children: truncate(title, 72) }},
            // Dek
            { type: 'div', props: { style: { fontSize:20, color:'rgba(255,255,255,0.5)', lineHeight:1.5, maxWidth:800, marginBottom:'auto' }, children: truncate(dek, 110) }},
            // Bottom bar
            { type: 'div', props: {
              style: { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:36, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.1)' },
              children: [
                // Business + date
                { type: 'div', props: {
                  style: { display:'flex', flexDirection:'column', gap:4 },
                  children: [
                    { type: 'div', props: { style: { fontSize:18, fontWeight:700, color:'#fff' }, children: business }},
                    { type: 'div', props: { style: { fontSize:13, color:'rgba(255,255,255,0.3)', letterSpacing:1 }, children: `NUI Editorial · ${date}` }},
                  ]
                }},
                // Rating + badges
                { type: 'div', props: {
                  style: { display:'flex', alignItems:'center', gap:12 },
                  children: [
                    { type: 'div', props: { style: { display:'flex', alignItems:'center', gap:8, background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.3)', padding:'8px 16px' }, children: [
                      { type: 'span', props: { style: { fontSize:18 }, children: '★' }},
                      { type: 'span', props: { style: { fontSize:18, fontWeight:700, color:'#ffd700' }, children: rating.toFixed(1) }},
                      { type: 'span', props: { style: { fontSize:13, color:'rgba(255,215,0,0.6)' }, children: 'NUI Verified' }},
                    ]}},
                    ...(award ? [{ type: 'div', props: { style: { background:'#ffd700', color:'#000', fontSize:12, fontWeight:800, letterSpacing:2, textTransform:'uppercase', padding:'8px 14px' }, children: '🏆 2025 Award' }}] : []),
                    { type: 'div', props: { style: { background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.4)', color:'#10b981', fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', padding:'8px 14px' }, children: '✓ Verified' }},
                  ]
                }},
              ]
            }},
          ]
        }},
      ]
    }
  };
}

export const handler = async (event) => {
  try {
    const p     = new URLSearchParams(event.queryStringParameters || {});
    const slug  = p.get('slug') || '';
    let   data  = ARTICLES[slug];

    if (!data) {
      data = {
        title:    p.get('title')  || 'New Urban Influence Magazine',
        dek:      p.get('dek')    || 'Detroit\'s creative authority. Features, citations, and verified profiles.',
        category: p.get('cat')    || 'Detroit Creator Network',
        business: p.get('biz')    || 'New Urban Influence',
        rating:   parseFloat(p.get('rating') || '5.0'),
        award:    p.get('award')  === 'true',
        date:     p.get('date')   || '2025',
      };
    }

    // Load font — gracefully skip if not present
    let fonts = [];
    try {
      const fontPath = join(__dirname, 'fonts', 'Inter-Bold.ttf');
      const fontData = readFileSync(fontPath);
      fonts = [{ name: 'sans-serif', data: fontData, weight: 700, style: 'normal' }];
    } catch {}

    const svg = await satori(buildTemplate(data), { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
      },
      body: Buffer.from(png).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('og-image error:', err);
    // Fallback redirect to static OG image
    return {
      statusCode: 302,
      headers: { Location: 'https://newurbaninfluence.com/images/og/magazine-cover.jpg' },
      body: '',
    };
  }
};
