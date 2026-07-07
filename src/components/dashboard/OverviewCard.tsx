import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatTile } from '@/components/dashboard/StatTile';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import type { StatTileData } from '@/data/dashboard';

interface OverviewCardProps {
  period?: string;
  onPeriodPress?: () => void;
}

interface ManagerOverview {
  totalPgs?: number;
  totalBeds: number;
  occupiedBeds: number;
  collection: number;
  pendingRent: number;
}

const money = (n: number) => `₹${(n / 1000).toFixed(1)}k`;

/** Maps the /manager/overview API response into the 6 StatTiles (icons, colors, labels). */
function toTiles(s: ManagerOverview): StatTileData[] {
  const totalBeds = s.totalBeds ?? 0;
  const occupied = s.occupiedBeds ?? 0;
  const vacant = Math.max(totalBeds - occupied, 0);
  const occupancy = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;
  return [
    {
      id: 'total-pgs',
      label: 'Total PGs',
      value: String(s.totalPgs ?? 0),
      iconFamily: 'ionicons',
      iconName: 'business-outline',
      iconColor: Colors.primary,
      iconBg: Colors.primaryLight,
      footerText: 'View all',
      footerIsLink: true,
    },
    {
      id: 'total-beds',
      label: 'Total Beds',
      value: String(totalBeds),
      iconFamily: 'material-community',
      iconName: 'bed-outline',
      iconColor: Colors.blue,
      iconBg: Colors.blueLight,
      footerText: 'View all',
      footerIsLink: true,
    },
    {
      id: 'occupied',
      label: 'Occupied',
      value: String(occupied),
      valueColor: Colors.green,
      iconFamily: 'ionicons',
      iconName: 'people-outline',
      iconColor: Colors.green,
      iconBg: Colors.greenLight,
      footerText: `${occupancy}%`,
      footerColor: Colors.green,
    },
    {
      id: 'vacant-beds',
      label: 'Vacant Beds',
      value: String(vacant),
      iconFamily: 'material-community',
      iconName: 'bed-empty',
      iconColor: Colors.orange,
      iconBg: Colors.orangeLight,
      footerText: `${100 - occupancy}%`,
      footerColor: Colors.red,
    },
    {
      id: 'collection',
      label: 'This Month Collection',
      value: money(s.collection ?? 0),
      iconFamily: 'font-awesome5',
      iconName: 'rupee-sign',
      iconColor: Colors.white,
      iconBg: Colors.green,
      footerText: 'View details',
      footerIsLink: true,
    },
    {
      id: 'pending-rent',
      label: 'Pending Rent',
      value: money(s.pendingRent ?? 0),
      valueColor: Colors.red,
      iconFamily: 'font-awesome5',
      iconName: 'rupee-sign',
      iconColor: Colors.white,
      iconBg: Colors.red,
      footerText: 'View details',
      footerIsLink: true,
    },
  ];
}

export function OverviewCard({ period = 'This Month', onPeriodPress }: OverviewCardProps) {
  const [tiles, setTiles] = useState<StatTileData[] | null>(null);

  useEffect(() => {
    let active = true;

    const MOCK_OVERVIEW: ManagerOverview = {
      totalPgs: 4,
      totalBeds: 48,
      occupiedBeds: 40,
      collection: 146000,
      pendingRent: 22500,
    };

    const fetchFromSupabase = async () => {
      // One role-scoped call: the overview() RPC (see supabase/migrations/0003)
      // aggregates PGs/beds/collection/pending for the signed-in owner/manager/admin.
      const { data, error } = await supabase.rpc('overview');

      if (error) {
        // RPC not deployed yet (PGRST202) — fall back to demo data so the
        // dashboard remains usable. Remove this fallback once 0003_functions.sql
        // has been applied to the Supabase project.
        console.warn('overview() RPC unavailable, using mock data:', error.message);
        if (active) setTiles(toTiles(MOCK_OVERVIEW));
        return;
      }

      const overview: ManagerOverview = {
        totalPgs: data?.totalPgs ?? 0,
        totalBeds: data?.totalBeds ?? 0,
        occupiedBeds: data?.occupiedBeds ?? 0,
        collection: Number(data?.collection ?? 0),
        pendingRent: Number(data?.pendingRent ?? 0),
      };

      if (active) setTiles(toTiles(overview));
    };

    fetchFromSupabase().catch((err) => {
      console.error('Supabase OverviewCard error:', err);
    });

    return () => { active = false; };
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Overview</Text>
        <Pressable
          onPress={onPeriodPress}
          style={styles.periodButton}
          accessibilityRole="button">
          <Text style={styles.periodText}>{period}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.primary} />
        </Pressable>
      </View>

      {!tiles ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 20 }} />
      ) : (
        <View style={styles.grid}>
          {tiles.map((t) => (
            <StatTile key={t.id} data={t} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
