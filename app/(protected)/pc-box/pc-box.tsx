'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Catch } from '@parthenonlab/types';

import {
  POKEBALL_IMAGE_MAP,
  POKEMON_TYPE_IMAGE_MAP,
  POKEMON_TYPE_MAP,
  POKEMON_URLS,
} from '@/constants/pokemon';

import { Loading } from '@/components';
import { useFetch, useParthenon } from '@/hooks';
import { SilverIcon } from '@/images/icons';
import { Pokemon } from '@/interfaces/games';
import { formatDate, formatTime, formatPokemonName } from '@/lib/utils';

import styles from './page.module.scss';

const fetchAllPokemon = async (): Promise<Map<number, Pokemon>> => {
  const listRes = await fetch(`${POKEMON_URLS.POKEAPI}?limit=151`);
  const list = await listRes.json();

  const map = new Map<number, Pokemon>();
  list.results.forEach((entry: { name: string; url: string }, i: number) => {
    map.set(i + 1, {
      id: i + 1,
      name: entry.name,
      sprite: `${POKEMON_URLS.POKEMONDB}/${entry.name}.png`,
      types: POKEMON_TYPE_MAP[entry.name] ?? [],
    });
  });
  return map;
};

const getBoxCapacity = (
  subscriber: boolean,
  linked: boolean,
  boxSpace: number,
) => {
  let capacity = subscriber ? 300 : 30;
  if (linked) capacity += 50;
  capacity += boxSpace;
  return capacity;
};

export const PcBox = () => {
  const { fetchDelete, fetchGetArray, fetchPatch } = useFetch();
  const { user, setStateUser } = useParthenon();
  const [pokemonMap, setPokemonMap] = useState<Map<number, Pokemon>>(new Map());
  const [catches, setCatches] = useState<Catch[]>([]);
  const [sort, setSort] = useState<'recent' | 'name' | 'id'>('recent');
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    Promise.all([fetchAllPokemon(), fetchGetArray<Catch>('/api/catches')]).then(
      ([allPokemon, allCatches]) => {
        setPokemonMap(allPokemon);
        setCatches(
          allCatches.sort(
            (a, b) =>
              new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime(),
          ),
        );
        setLoading(false);
      },
    );
  }, [fetchGetArray]);

  if (loading) return <Loading />;

  const linked = !!(user?.discord_id && user?.twitch_id);
  const capacity = getBoxCapacity(
    user?.subscriber ?? false,
    linked,
    user?.box_space ?? 0,
  );
  const unique = new Set(catches.map(c => c.pokemon_id)).size;

  const handleUpgrade = async () => {
    if (!user) return;
    if (
      !confirm(
        'Upgrade PC Box by 10 slots for 10,000 silver? This cannot be undone.',
      )
    )
      return;
    setUpgrading(true);
    try {
      const res = await fetchPatch<
        { cash: number; box_space: number },
        { action: string }
      >(`/api/users/${user.discord_id}`, { action: 'upgrade_box' });
      if (res) setStateUser({ ...user, ...res });
    } finally {
      setUpgrading(false);
    }
  };

  const handleRelease = async (id: string, pokemonName: string) => {
    if (
      !confirm(
        `Release ${formatPokemonName(pokemonName)}? This cannot be undone.`,
      )
    )
      return;
    setReleasing(id);
    try {
      const res = await fetchDelete(`/api/catches/${id}`);
      if (res) setCatches(prev => prev.filter(c => c.catch_id !== id));
    } finally {
      setReleasing(null);
    }
  };

  const sortedCatches = [...catches].sort((a, b) => {
    if (sort === 'recent')
      return new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime();
    if (sort === 'name') {
      const nameA = pokemonMap.get(a.pokemon_id)?.name ?? '';
      const nameB = pokemonMap.get(b.pokemon_id)?.name ?? '';
      return nameA.localeCompare(nameB);
    }
    return a.pokemon_id - b.pokemon_id;
  });

  return (
    <div className={styles.pcBox}>
      <div className={styles.headline}>
        <div className={styles.upgradeSection}>
          <p className={styles.upgradeInfo}>
            Balance: {user?.cash?.toLocaleString() ?? 0}{' '}
            <SilverIcon size={14} />
          </p>
          <p className={styles.upgradeInfo}>
            Available Space: {Math.max(0, capacity - catches.length)} /{' '}
            {capacity}
            {catches.length >= capacity && (
              <>
                {' '}
                — <span className={styles.full}>FULL</span>
              </>
            )}
          </p>
          <button
            className={styles.upgradeButton}
            onClick={handleUpgrade}
            disabled={upgrading || (user?.cash ?? 0) < 10000}>
            {upgrading ? '...' : 'Add 10 Slots — 10,000'}
            <SilverIcon size={14} />
          </button>
        </div>
        <h1>PC BOX</h1>
        <Link href="/pokedex" className={styles.pokedexLink}>
          Go to Pokédex →
        </Link>
      </div>
      <p className={styles.subtitle}>
        Obtained: {catches.length} | Unique: {unique}
      </p>
      <div className={styles.sortButtons}>
        {(['recent', 'name', 'id'] as const).map(option => (
          <button
            key={option}
            className={`${styles.sortButton} ${sort === option ? styles.active : ''}`}
            onClick={() => setSort(option)}>
            {option === 'recent'
              ? 'Most Recent'
              : option === 'name'
                ? 'Alphabetical'
                : 'Pokédex #'}
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {sortedCatches.map(c => {
          const pokemon = pokemonMap.get(c.pokemon_id);
          if (!pokemon) return null;
          return (
            <div key={c.catch_id} className={styles.slot}>
              <div className={`${styles.card} ${c.shiny ? styles.shiny : ''}`}>
                <span className={styles.dexId}>
                  #{String(pokemon.id).padStart(4, '0')}
                </span>
                {c.favorite && <span className={styles.favorite}>★</span>}
                <img
                  src={
                    c.shiny
                      ? pokemon.sprite.replace('/normal/', '/shiny/')
                      : pokemon.sprite
                  }
                  alt={pokemon.name}
                  className={styles.sprite}
                />
                <span className={styles.name}>
                  {formatPokemonName(pokemon.name)}
                </span>
                <div className={styles.types}>
                  {pokemon.types.map(type => (
                    <span
                      key={type}
                      className={`${styles.type} ${styles[type]}`}>
                      <img
                        src={POKEMON_TYPE_IMAGE_MAP[type]}
                        alt={type}
                        className={styles.typeImage}
                      />
                      <span className={styles.typeLabel}>{type}</span>
                    </span>
                  ))}
                </div>
                <div className={styles.meta}>
                  {c.gender &&
                    !['nidoran-f', 'nidoran-m'].includes(pokemon.name) && (
                      <span className={styles.gender}>
                        {c.gender === 'female' ? '♀' : '♂'}
                      </span>
                    )}
                  {c.shiny && <span className={styles.shinyBadge}>✦</span>}
                </div>
                <div className={styles.caught}>
                  <img
                    src={
                      POKEBALL_IMAGE_MAP[c.ball_used] ??
                      POKEBALL_IMAGE_MAP.pokeball
                    }
                    alt="Pokéball"
                    className={styles.pokeball}
                  />
                  <span>
                    {formatDate(new Date(c.caught_at))}{' '}
                    {formatTime(new Date(c.caught_at))}
                  </span>
                </div>
              </div>
              <button
                className={styles.releaseButton}
                onClick={() => handleRelease(c.catch_id, pokemon.name)}
                disabled={releasing === c.catch_id}>
                {releasing === c.catch_id ? '...' : 'Release'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
