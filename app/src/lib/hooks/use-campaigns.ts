"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_CRITERIA,
  makeCriterionKey,
  type Campaign,
  type QualifyingCriterion,
} from "@/lib/types";

const STORAGE_KEY = "ct.campaigns.v1";

export type CampaignsState = { campaigns: Campaign[]; activeId: string };

// ── Pure reducers (unit-tested) ────────────────────────────────────────────

export function seedState(): CampaignsState {
  const campaign: Campaign = {
    id: "campaign_default",
    name: "Default campaign",
    criteria: [...DEFAULT_CRITERIA],
  };
  return { campaigns: [campaign], activeId: campaign.id };
}

export function addCriterion(campaigns: Campaign[], campaignId: string, label: string): Campaign[] {
  const trimmed = label.trim();
  if (!trimmed) return campaigns;
  return campaigns.map((c) => {
    if (c.id !== campaignId) return c;
    if (c.criteria.some((cr) => cr.label.toLowerCase() === trimmed.toLowerCase())) return c;
    const criterion: QualifyingCriterion = { key: makeCriterionKey(trimmed), label: trimmed, custom: true };
    return { ...c, criteria: [...c.criteria, criterion] };
  });
}

export function removeCriterion(campaigns: Campaign[], campaignId: string, key: string): Campaign[] {
  return campaigns.map((c) =>
    c.id === campaignId
      ? { ...c, criteria: c.criteria.filter((cr) => cr.key !== key || !cr.custom) }
      : c,
  );
}

export function addCampaign(campaigns: Campaign[], name: string): { campaigns: Campaign[]; id: string } {
  const id = `campaign_${Date.now()}`;
  const campaign: Campaign = { id, name: name.trim() || "Untitled campaign", criteria: [...DEFAULT_CRITERIA] };
  return { campaigns: [...campaigns, campaign], id };
}

// ── Client store (localStorage + subscribers) ──────────────────────────────

let _state: CampaignsState | null = null;
const _subs = new Set<(s: CampaignsState) => void>();

function load(): CampaignsState {
  if (_state) return _state;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CampaignsState;
        if (parsed.campaigns?.length) {
          _state = parsed;
          return _state;
        }
      }
    } catch {
      /* fall through to seed */
    }
  }
  _state = seedState();
  return _state;
}

function commit(next: CampaignsState) {
  _state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private mode */
    }
  }
  for (const s of _subs) s(next);
}

export function useCampaigns() {
  const [state, setState] = useState<CampaignsState>(load);

  useEffect(() => {
    const onChange = (s: CampaignsState) => setState(s);
    _subs.add(onChange);
    setState(load());
    return () => {
      _subs.delete(onChange);
    };
  }, []);

  const activeCampaign = state.campaigns.find((c) => c.id === state.activeId) ?? state.campaigns[0];

  const setActive = useCallback((id: string) => {
    commit({ ..._state!, activeId: id });
  }, []);

  const create = useCallback((name: string) => {
    const { campaigns, id } = addCampaign(_state!.campaigns, name);
    commit({ campaigns, activeId: id });
  }, []);

  const addParam = useCallback((label: string) => {
    commit({ ..._state!, campaigns: addCriterion(_state!.campaigns, _state!.activeId, label) });
  }, []);

  const removeParam = useCallback((key: string) => {
    commit({ ..._state!, campaigns: removeCriterion(_state!.campaigns, _state!.activeId, key) });
  }, []);

  return { campaigns: state.campaigns, activeCampaign, setActive, create, addParam, removeParam };
}
