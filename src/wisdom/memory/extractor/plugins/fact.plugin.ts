// src/wisdom/memory/extractor/plugins/fact.plugin.ts

import { injectable } from "tsyringe";

import { SemanticContext, EntityType } from "@/wisdom/semantic/semantic-context";
import { WisdomResponse } from "@/wisdom/contracts/response";
import { AIContext } from "@/wisdom/contracts/ai-context";

import { ArtifactType } from "@/wisdom/shared/enums/artifact-type.enum";

import { FactLearnedDelta } from "../../type/cognitiveDelta";
import { IUserKnowledge } from "../../model/IUserKnowledge";
import { KnowledgePlugin } from "./knowledge-plugin.interface";

@injectable()
export class FactPlugin implements KnowledgePlugin {

    readonly name = "FactPlugin";

    extract(
        semantic: SemanticContext,
        response: WisdomResponse,
        _context: AIContext,
        knowledge: IUserKnowledge,
    ): FactLearnedDelta[] {

        const deltas: FactLearnedDelta[] = [];

        //---------------------------------------------------------
        // User stated facts
        //---------------------------------------------------------

        for (const entity of semantic.entities ?? []) {

            switch (entity.type) {

                case EntityType.DATE_RANGE:// 型 'EntityType.DATE_RANGE' は型 'SemanticEntityType' と比較できません。
                    this.addFact(
                        deltas,
                        knowledge,
                        `DATE_RANGE:${JSON.stringify(entity.value)}`,
                        entity.value,
                        `User specified date range ${JSON.stringify(entity.value)}`,
                        "user",
                        0.9,
                    );

                    break;

                case EntityType.BOOKING_ID:
                    this.addFact(
                        deltas,
                        knowledge,
                        `BOOKING_ID:${entity.value}`,
                        entity.value,
                        `User referenced booking ${entity.value}`,
                        "user",
                        0.95,
                    );

                    break;
            }
        }

        //---------------------------------------------------------
        // System artifacts
        //---------------------------------------------------------

        for (const artifact of response.artifacts ?? []) {

            switch (artifact.type) {

                case ArtifactType.LISTING_SEARCH_RESULT:
                    this.handleSearchResult(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.LISTING_SELECTED:
                    this.handleListingSelected(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.DATES_SELECTED:
                    this.handleDatesSelected(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.GUEST_COUNT_SELECTED:
                    this.handleGuestCountSelected(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.CONTACT_SET:
                    this.handleContactSet(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.SPECIAL_REQUEST_SET:
                    this.handleSpecialRequestSet(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.BOOKING_CREATED:
                    this.handleBookingCreated(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.BOOKING_CONFIRMED:
                    this.handleBookingConfirmed(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;

                case ArtifactType.BOOKING_CANCELLED:
                    this.handleBookingCancelled(
                        artifact.content,
                        knowledge,
                        deltas,
                    );
                    break;
            }
        }

        return deltas;
    }

    //---------------------------------------------------------
    // Listing Search
    //---------------------------------------------------------

    private handleSearchResult(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        const listings = content?.listings ?? [];

        for (const listing of listings) {

            if (!listing.id) {
                continue;
            }

            this.addFact(
                deltas,
                knowledge,
                `LISTING:${listing.id}`,
                {
                    id: listing.id,
                    title: listing.title,
                    price: listing.price,
                },
                `Listing "${listing.title}" appeared in search results`,
                "behavior",
                0.85,
            );
        }
    }

    //---------------------------------------------------------
    // Listing Selected
    //---------------------------------------------------------

    private handleListingSelected(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `LISTING_SELECTED:${content.listingId}`,
            content,
            `Listing "${content.listingTitle}" selected`,
        );
    }

    //---------------------------------------------------------
    // Dates
    //---------------------------------------------------------

    private handleDatesSelected(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `DATES:${content.checkInDate}:${content.checkOutDate}`,
            content,
            `Dates selected`,
        );
    }

    //---------------------------------------------------------
    // Guest Count
    //---------------------------------------------------------

    private handleGuestCountSelected(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `GUEST_COUNT:${content.guestCount}`,
            content,
            `Guest count selected`,
        );
    }

    //---------------------------------------------------------
    // Contact
    //---------------------------------------------------------

    private handleContactSet(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `CONTACT:${content.contactName}`,
            content,
            `Contact selected`,
        );
    }

    //---------------------------------------------------------
    // Special Requests
    //---------------------------------------------------------

    private handleSpecialRequestSet(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `SPECIAL_REQUEST:${content.specialRequests}`,
            content,
            `Special requests set`,
        );
    }

    //---------------------------------------------------------
    // Booking Created
    //---------------------------------------------------------

    private handleBookingCreated(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `BOOKING_CREATED:${content.id}`,
            content,
            `Booking ${content.id} created`,
        );
    }

    //---------------------------------------------------------
    // Booking Confirmed
    //---------------------------------------------------------

    private handleBookingConfirmed(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `BOOKING_CONFIRMED:${content.id}`,
            content,
            `Booking ${content.id} confirmed`,
        );
    }

    //---------------------------------------------------------
    // Booking Cancelled
    //---------------------------------------------------------

    private handleBookingCancelled(
        content: any,
        knowledge: IUserKnowledge,
        deltas: FactLearnedDelta[],
    ) {

        this.addFact(
            deltas,
            knowledge,
            `BOOKING_CANCELLED:${content.id}`,
            content,
            `Booking ${content.id} cancelled`,
        );
    }

    //---------------------------------------------------------
    // Shared helper
    //---------------------------------------------------------

    private addFact(
        deltas: FactLearnedDelta[],
        knowledge: IUserKnowledge,
        key: string,
        value: unknown,
        evidence: string,
        source: "user" | "behavior" = "behavior",
        confidence = 0.95,
    ) {

        if (this.hasFact(knowledge, key)) {
            return;
        }

        deltas.push({
            kind: "FACT_LEARNED",
            data: {
                key,
                value,
                confidence,
                createdAt: Date.now(),
                source,
            },
            evidence,
        });
    }

    //---------------------------------------------------------
    // Existing?
    //---------------------------------------------------------

    private hasFact(
        knowledge: IUserKnowledge,
        key: string,
    ): boolean {

        return knowledge.facts.some(
            fact => fact.key === key,
        );
    }
}