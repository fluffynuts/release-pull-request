import "expect-even-more-jest";
import { sortChoices, merge } from "../src/release-pull-request";
import { Choice } from "../src/interfaces";

describe(`release-pull-request`, () => {
    describe(`sortPreferred`, () => {
        it(`should be a function`, async () => {
            // Arrange
            // Act
            expect(sortChoices)
                .toBeFunction();
            // Assert
        });

        describe(`when no history`, () => {
            it(`should sort alphabetical, case-insensitive`, async () => {
                // Arrange
                const
                    list = makeChoices([ "B", "a", "z", "f" ]),
                    original = [ ...list ],
                    expected = makeChoices([ "a", "B", "f", "z" ]);
                // Act
                const result = await sortChoices(list, [], "Recent", "Other");
                // Assert
                expect(result)
                    .toEqual(expected);
                expect(list)
                    .toEqual(original);
            });
        });

        describe(`when have history`, () => {
            it(`should sort alphabetical, with historical items first`, async () => {
                // Arrange
                const
                    list = makeChoices([ "b", "a", "z", "f" ]),
                    history = [ "z", "f" ],
                    expected = [ "[RECENT]", "f", "z", "[OTHER]", "a", "b", "[\u001b[2m──────────────\u001b[22m]" ];
                // Act
                const result = await sortChoices(list, history, "RECENT", "OTHER");
                // Assert
                const values = result.map((o: any) => {
                    if (o["type"] === "separator") {
                        return `[${o.separator}]`;
                    }
                    return o.value;
                });
                expect(values)
                    .toEqual(expected);
            });
        });

    });

    describe(`merge`, () => {
        it(`should overwrite non-array properties`, async () => {
            // Arrange
            const
                a = { a: 1, b: 2 },
                b = { a: 2, c: 3 };
            // Act
            const result = merge(a, b);
            // Assert
            expect(result)
                .toBe(a);
            expect(result.a)
                .toEqual(2);
            expect(result.b)
                .toEqual(2);
            expect(result.c)
                .toEqual(3);
        });

        it(`should insert array elements`, async () => {
            // Arrange
            const
                a = { items: [ 2, 3 ] },
                b = { items: [ 0, 1 ] };
            // Act
            merge(a, b);
            // Assert
            expect(a.items)
                .toEqual([0, 1, 2, 3]);
        });
    });

    function makeChoices(values: string[]): Choice[] {
        return values.map(
            s => ({ value: s, name: s, disabled: false })
        );
    }
});
