### Compostion JSON for the ```/diagnose``` route.
This will be posted to EHRbase when symptoms submitted.
```json
{
    "_type": "COMPOSITION",
    "archetype_node_id": "openEHR-EHR-COMPOSITION.encounter.v1",
    "name": { "_type": "DV_TEXT", "value": "Encounter" },
    "archetype_details": {
        "_type": "ARCHETYPED",
        "archetype_id": { "_type": "ARCHETYPE_ID", "value": "openEHR-EHR-COMPOSITION.encounter.v1" },
        "template_id": { "_type": "TEMPLATE_ID", "value": "new_template" },
        "rm_version": "1.0.4"
    },
    "language": { "_type": "CODE_PHRASE", "terminology_id": { "_type": "TERMINOLOGY_ID", "value": "ISO_639-1" }, "code_string": "en" },
    "territory": { "_type": "CODE_PHRASE", "terminology_id": { "_type": "TERMINOLOGY_ID", "value": "ISO_3166-1" }, "code_string": "EN" },
    "category": {
        "_type": "DV_CODED_TEXT",
        "value": "event",
        "defining_code": { "_type": "CODE_PHRASE", "terminology_id": { "_type": "TERMINOLOGY_ID", "value": "openehr" }, "code_string": "433" }
    },
    "composer": { "_type": "PARTY_SELF" },
    "content": [
        {
            "_type": "OBSERVATION",
            "archetype_node_id": "openEHR-EHR-OBSERVATION.symptom_sign.v0",
            "name": { "_type": "DV_TEXT", "value": "Symptom/Sign" },
            "language": { "_type": "CODE_PHRASE", "terminology_id": { "_type": "TERMINOLOGY_ID", "value": "ISO_639-1" }, "code_string": "en" },
            "encoding": { "_type": "CODE_PHRASE", "terminology_id": { "_type": "TERMINOLOGY_ID", "value": "IANA_character-sets" }, "code_string": "UTF-8" },
            "subject": { "_type": "PARTY_SELF" },
            "data": {
                "_type": "HISTORY",
                "archetype_node_id": "at0190",
                "name": { "_type": "DV_TEXT", "value": "Event Series" },
                "origin": { "_type": "DV_DATE_TIME", "value": "2024-01-01T00:00:00Z" },
                "events": [
                    {
                        "_type": "POINT_EVENT",
                        "archetype_node_id": "at0191",
                        "name": { "_type": "DV_TEXT", "value": "Any event" },
                        "time": { "_type": "DV_DATE_TIME", "value": "2024-01-01T00:00:00Z" },
                        "data": {
                            "_type": "ITEM_TREE",
                            "archetype_node_id": "at0192",
                            "name": { "_type": "DV_TEXT", "value": "Tree" },
                            "items": [
                                {
                                    "_type": "ELEMENT",
                                    "archetype_node_id": "at0001",
                                    "name": { "_type": "DV_TEXT", "value": "Symptom/Sign name" },
                                    "value": { "_type": "DV_TEXT", "value": "headache" }
                                },
                                {
                                    "_type": "ELEMENT",
                                    "archetype_node_id": "at0021",
                                    "name": { "_type": "DV_TEXT", "value": "Severity category" },
                                    "value": {
                                        "_type": "DV_CODED_TEXT",
                                        "value": "Moderate",
                                        "defining_code": { "_type": "CODE_PHRASE", "terminology_id": { "_type": "TERMINOLOGY_ID", "value": "local" }, "code_string": "at0024" }
                                    }
                                },
                                {
                                    "_type": "ELEMENT",
                                    "archetype_node_id": "at0026",
                                    "name": { "_type": "DV_TEXT", "value": "Severity rating" },
                                    "value": { "_type": "DV_QUANTITY", "magnitude": 7.0, "units": "1" }
                                },
                                {
                                    "_type": "ELEMENT",
                                    "archetype_node_id": "at0028",
                                    "name": { "_type": "DV_TEXT", "value": "Duration" },
                                    "value": { "_type": "DV_DURATION", "value": "P3D" }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}
```
