"""
neemSEO Keyword Clustering Engine.
Groups related keywords using token overlap, N-gram extraction, and Jaccard similarity.
Computes cluster-level aggregates: search volume, average difficulty, and dominant intent.
"""

import re
from collections import Counter, defaultdict
from typing import List, Dict, Set
from neemseo.keywords.schemas import KeywordItem, KeywordClusterGroup, SearchIntent


STOPWORDS = {
    "a", "an", "the", "in", "on", "at", "for", "to", "of", "with", "by", "and",
    "or", "is", "are", "was", "were", "be", "been", "from", "as", "into", "about",
    "like", "through", "after", "over", "between", "out", "against", "during",
    "without", "before", "under", "around", "among", "can", "do", "does", "did",
}


class KeywordClusterer:
    """Clusters keywords by shared lexical roots and semantic tokens."""

    @classmethod
    def _tokenize(cls, text: str) -> List[str]:
        raw_tokens = re.findall(r"\b[\w\-']+\b", text.lower())
        return [t for t in raw_tokens if t not in STOPWORDS and len(t) > 1]

    @classmethod
    def _find_top_ngrams(cls, tokenized_list: List[List[str]], top_n: int = 15) -> List[tuple[str, int]]:
        """Identifies prominent bigrams and unigrams across the dataset."""
        counter = Counter()
        for tokens in tokenized_list:
            # Unigrams
            for t in tokens:
                counter[t] += 1
            # Bigrams
            for i in range(len(tokens) - 1):
                bg = f"{tokens[i]} {tokens[i+1]}"
                counter[bg] += 2  # Bigrams are weighted higher than single words

        return counter.most_common(top_n)

    @classmethod
    def cluster(
        cls,
        items: List[KeywordItem],
        min_cluster_size: int = 2,
    ) -> List[KeywordClusterGroup]:
        """
        Groups keyword items into coherent thematic clusters.
        """
        if not items:
            return []

        # Tokenize all keywords
        tokenized_items = [(item, set(cls._tokenize(item.keyword))) for item in items]

        # Count 2-word and 1-word frequent patterns
        phrase_counter = Counter()
        for item, tokens in tokenized_items:
            token_list = cls._tokenize(item.keyword)
            # Bigrams
            for i in range(len(token_list) - 1):
                phrase_counter[f"{token_list[i]} {token_list[i+1]}"] += 1
            # Unigrams
            for t in token_list:
                phrase_counter[t] += 1

        # Select candidate themes with frequency >= min_cluster_size
        candidate_themes = [
            phrase for phrase, count in phrase_counter.most_common(30)
            if count >= min_cluster_size and len(phrase) > 2
        ]

        # Prefer 2-word phrases over single words to create more specific cluster titles
        candidate_themes.sort(key=lambda x: (len(x.split()), len(x)), reverse=True)

        assigned_items: Set[str] = set()
        clusters_dict: Dict[str, List[KeywordItem]] = defaultdict(list)

        for theme in candidate_themes:
            theme_tokens = set(theme.split())
            for item, tokens in tokenized_items:
                if item.keyword in assigned_items:
                    continue
                if theme_tokens.issubset(tokens):
                    clusters_dict[theme.title()].append(item)
                    assigned_items.add(item.keyword)

        # Remaining unassigned keywords go to General or their own category
        unassigned = [item for item, _ in tokenized_items if item.keyword not in assigned_items]
        if unassigned:
            clusters_dict["Other Opportunities"].extend(unassigned)

        # Build KeywordClusterGroup objects
        result_clusters: List[KeywordClusterGroup] = []

        for c_name, c_keywords in clusters_dict.items():
            if not c_keywords:
                continue

            # Update cluster field on items
            for kw in c_keywords:
                kw.cluster = c_name

            total_vol = sum(k.search_volume for k in c_keywords)
            avg_diff = round(sum(k.difficulty for k in c_keywords) / len(c_keywords), 1)

            # Determine dominant intent
            intent_counts = Counter(k.intent for k in c_keywords)
            dominant_intent = intent_counts.most_common(1)[0][0] if intent_counts else SearchIntent.INFORMATIONAL

            # Sort keywords inside cluster by priority score descending
            sorted_keywords = sorted(c_keywords, key=lambda k: k.priority_score, reverse=True)

            result_clusters.append(
                KeywordClusterGroup(
                    cluster_name=c_name,
                    keyword_count=len(sorted_keywords),
                    total_volume=total_vol,
                    average_difficulty=avg_diff,
                    dominant_intent=dominant_intent,
                    keywords=sorted_keywords,
                )
            )

        # Sort clusters by total search volume and count descending
        result_clusters.sort(key=lambda c: (c.total_volume, c.keyword_count), reverse=True)
        return result_clusters

